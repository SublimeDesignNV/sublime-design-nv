import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAssetByPublicId } from "@/lib/cloudinary.server";
import {
  ASSET_DEBUG_SELECT,
  buildAssetDebugReport,
} from "@/lib/adminAssetDebug.server";

type BackfillBody = {
  dryRun?: boolean;
  limit?: number;
};

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as BackfillBody;
  const dryRun = body.dryRun !== false;
  const limit =
    typeof body.limit === "number" && Number.isFinite(body.limit)
      ? Math.max(1, Math.min(Math.floor(body.limit), 500))
      : 200;

  const assets = await db.asset.findMany({
    select: ASSET_DEBUG_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  let fixed = 0;
  const unresolvedReasons = new Map<string, number>();
  const unresolvedAssets: Array<{ id: string; title: string | null; diagnosis: string }> = [];
  const updates: Array<{ id: string; data: Record<string, unknown> }> = [];

  for (const asset of assets) {
    const repairData: Record<string, unknown> = {};

    if (asset.publicId) {
      const cloudinaryAsset = await getAssetByPublicId(asset.publicId);
      if (cloudinaryAsset) {
        if (!asset.secureUrl || asset.secureUrl !== cloudinaryAsset.secure_url) {
          repairData.secureUrl = cloudinaryAsset.secure_url;
        }
        if (!asset.width && cloudinaryAsset.width) repairData.width = cloudinaryAsset.width;
        if (!asset.height && cloudinaryAsset.height) repairData.height = cloudinaryAsset.height;
        if (!asset.format && cloudinaryAsset.format) repairData.format = cloudinaryAsset.format;
      }
    }

    if (Object.keys(repairData).length > 0) {
      updates.push({ id: asset.id, data: repairData });
      if (!dryRun) {
        await db.asset.update({
          where: { id: asset.id },
          data: repairData,
        });
      }
      fixed += 1;
    }

    const latestRow =
      Object.keys(repairData).length > 0 && !dryRun
        ? await db.asset.findUnique({ where: { id: asset.id }, select: ASSET_DEBUG_SELECT })
        : asset;
    const report = await buildAssetDebugReport(latestRow ?? asset);

    if (report.diagnosis !== "renderable") {
      unresolvedReasons.set(
        report.diagnosis,
        (unresolvedReasons.get(report.diagnosis) ?? 0) + 1,
      );
      unresolvedAssets.push({
        id: asset.id,
        title: asset.title,
        diagnosis: report.diagnosis,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    totalScanned: assets.length,
    totalFixed: fixed,
    totalStillBroken: unresolvedAssets.length,
    reasonsUnresolved: Object.fromEntries(unresolvedReasons),
    updates,
    unresolvedAssets,
  });
}
