import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { galleryFeature?: boolean };

  if (typeof body.galleryFeature !== "boolean") {
    return NextResponse.json({ ok: false, error: "galleryFeature (boolean) is required." }, { status: 400 });
  }

  const asset = await db.asset.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!asset) {
    return NextResponse.json({ ok: false, error: "Asset not found." }, { status: 404 });
  }

  await db.asset.update({
    where: { id: params.id },
    data: { galleryFeature: body.galleryFeature },
  });

  return NextResponse.json({ ok: true, galleryFeature: body.galleryFeature });
}
