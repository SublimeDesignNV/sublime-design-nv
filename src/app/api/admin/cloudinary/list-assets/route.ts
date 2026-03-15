import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { listAssetsByPublicIdPrefix } from "@/lib/cloudinary.server";

const ALLOWED_ROOT_PREFIXES = ["Sublime/Gallery", "Sublime/Projects"] as const;

type ListAssetsBody = {
  folderPrefix?: string;
  maxResults?: number;
};

function isAllowedPrefix(folderPrefix: string) {
  return ALLOWED_ROOT_PREFIXES.some(
    (root) => folderPrefix === root || folderPrefix.startsWith(`${root}/`),
  );
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  const body = (await request.json().catch(() => ({}))) as ListAssetsBody;
  const folderPrefix = body.folderPrefix?.trim() || "";

  if (!folderPrefix || !isAllowedPrefix(folderPrefix)) {
    return NextResponse.json(
      { ok: false, error: "folderPrefix is invalid" },
      { status: 400 },
    );
  }

  const maxResults =
    typeof body.maxResults === "number" && Number.isInteger(body.maxResults)
      ? Math.min(Math.max(body.maxResults, 1), 500)
      : 200;

  const assets = await listAssetsByPublicIdPrefix(folderPrefix, maxResults);

  return NextResponse.json({
    ok: true,
    assets: assets.map((asset) => ({
      public_id: asset.public_id,
      secure_url: asset.secure_url,
      created_at: asset.created_at,
      width: asset.width,
      height: asset.height,
      format: asset.format,
      context: asset.context ?? {},
      tags: asset.tags ?? [],
    })),
  });
}
