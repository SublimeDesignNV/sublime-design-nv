import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public route — used by vision polling. Returns status + vision result only.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  // Support both token and leadId for the vision page
  const lead = await db.intakeLead.findFirst({
    where: { OR: [{ token }, { id: token }] },
    select: {
      visionStatus: true,
      visionResult: true,
      assets: {
        where: { type: "VISION_RENDER" },
        select: { url: true },
        take: 1,
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    visionStatus: lead.visionStatus,
    visionResult: lead.visionResult,
    renderUrl: lead.assets[0]?.url ?? null,
  });
}
