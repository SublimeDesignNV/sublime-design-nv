import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ASSET_DEBUG_SELECT,
  buildAssetDebugReport,
  compareAssetDebugReports,
} from "@/lib/adminAssetDebug.server";

export async function GET(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const workingId = request.nextUrl.searchParams.get("workingId")?.trim();
  const brokenId = request.nextUrl.searchParams.get("brokenId")?.trim();

  if (!workingId || !brokenId) {
    return NextResponse.json(
      { ok: false, error: "workingId and brokenId are required." },
      { status: 400 },
    );
  }

  const [workingAsset, brokenAsset] = await Promise.all([
    db.asset.findUnique({ where: { id: workingId }, select: ASSET_DEBUG_SELECT }),
    db.asset.findUnique({ where: { id: brokenId }, select: ASSET_DEBUG_SELECT }),
  ]);

  if (!workingAsset || !brokenAsset) {
    return NextResponse.json(
      { ok: false, error: "One or both assets were not found." },
      { status: 404 },
    );
  }

  const [working, broken] = await Promise.all([
    buildAssetDebugReport(workingAsset),
    buildAssetDebugReport(brokenAsset),
  ]);

  return NextResponse.json({
    ok: true,
    working,
    broken,
    differences: compareAssetDebugReports(working, broken),
  });
}
