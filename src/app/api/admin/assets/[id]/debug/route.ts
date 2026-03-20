import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ASSET_DEBUG_SELECT,
  buildAssetDebugReport,
} from "@/lib/adminAssetDebug.server";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  void request;

  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const asset = await db.asset.findUnique({
    where: { id: context.params.id },
    select: ASSET_DEBUG_SELECT,
  });

  if (!asset) {
    return NextResponse.json(
      { ok: false, error: "Asset not found." },
      { status: 404 },
    );
  }

  const report = await buildAssetDebugReport(asset);

  return NextResponse.json({
    ok: true,
    assetId: asset.id,
    ...report,
  });
}
