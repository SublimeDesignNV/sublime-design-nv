import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { addAssetTags, removeAssetTags, listAssetsByServiceTag } from "@/lib/cloudinary.server";
import { db } from "@/lib/db";

type Params = { params: { id: string } };

// POST /api/admin/assets/[id]/hero
// Sets this asset as the hero for its service (removes hero tag from all others in the service)
export async function POST(_req: NextRequest, { params }: Params) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const asset = await db.asset.findUnique({
    where: { id: params.id },
    select: { id: true, publicId: true, primaryServiceSlug: true, kind: true },
  });

  if (!asset) {
    return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
  }
  if (!asset.publicId) {
    return NextResponse.json({ ok: false, error: "Asset has no publicId" }, { status: 400 });
  }
  if (asset.kind !== "IMAGE") {
    return NextResponse.json({ ok: false, error: "Only images can be set as hero" }, { status: 400 });
  }

  const serviceSlug = asset.primaryServiceSlug;

  // Unset isHero on all assets for this service in DB, then set on this one
  if (serviceSlug) {
    await db.asset.updateMany({
      where: { primaryServiceSlug: serviceSlug, isHero: true },
      data: { isHero: false },
    });
  }
  await db.asset.update({ where: { id: asset.id }, data: { isHero: true } });

  // Remove hero tag from all current hero images for this service in Cloudinary
  if (serviceSlug) {
    try {
      const serviceAssets = await listAssetsByServiceTag(serviceSlug);
      const currentHeroes = serviceAssets.filter((a) =>
        a.tags?.some((t) => t.toLowerCase() === "hero"),
      );
      await Promise.all(
        currentHeroes
          .filter((a) => a.public_id !== asset.publicId)
          .map((a) => removeAssetTags(a.public_id, ["hero"])),
      );
    } catch {
      // Non-fatal — proceed to set the new hero
    }
  }

  // Add hero tag to this asset in Cloudinary
  try {
    await addAssetTags(asset.publicId, ["hero"]);
  } catch {
    // Non-fatal — DB is the source of truth now
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/assets/[id]/hero
// Removes the hero tag from this asset
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const asset = await db.asset.findUnique({
    where: { id: params.id },
    select: { id: true, publicId: true },
  });

  if (!asset?.publicId) {
    return NextResponse.json({ ok: false, error: "Asset not found or has no publicId" }, { status: 404 });
  }

  await removeAssetTags(asset.publicId, ["hero"]);

  return NextResponse.json({ ok: true });
}
