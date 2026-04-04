import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVision } from "@/lib/ai/generateVision";
import type { Prisma } from "@prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  console.log("[generate-route] POST /api/leads/[id]/generate — leadId:", id);

  const lead = await db.intakeLead.findUnique({
    where: { id },
    include: { assets: true },
  });

  if (!lead) {
    console.error("[generate-route] Lead not found:", id);
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  console.log("[generate-route] lead found, serviceType:", lead.serviceType, "assets:", lead.assets.length);

  // Immediately mark as GENERATING and return — actual work happens async
  await db.intakeLead.update({
    where: { id },
    data: { visionStatus: "GENERATING" },
  });

  console.log("[generate-route] marked GENERATING, starting background job");

  // Fire-and-forget background generation
  void (async () => {
    try {
      console.log("[generate-route] background job: calling generateVision");
      const result = await generateVision(lead);
      console.log("[generate-route] background job: generateVision returned, headline:", result.headline);

      // If there's a render URL, save it as a VISION_RENDER asset
      if (result.renderUrl) {
        console.log("[generate-route] background job: saving VISION_RENDER asset");
        await db.intakeLeadAsset.create({
          data: {
            leadId: id,
            type: "VISION_RENDER",
            url: result.renderUrl,
            caption: result.headline,
          },
        });
      }

      await db.intakeLead.update({
        where: { id },
        data: {
          visionPrompt: JSON.stringify(result.imageGenerationPrompt ?? ""),
          visionResult: result as unknown as Prisma.InputJsonValue,
          visionStatus: "COMPLETE",
          status: "VISION_GENERATED",
        },
      });

      console.log("[generate-route] background job: marked COMPLETE for leadId:", id);
    } catch (err) {
      console.error("[generate-route] background job: FAILED for leadId:", id);
      console.error("[generate-route] background job: error name:", err instanceof Error ? err.name : typeof err);
      console.error("[generate-route] background job: error message:", err instanceof Error ? err.message : String(err));
      console.error("[generate-route] background job: full error:", err);
      await db.intakeLead.update({
        where: { id },
        data: { visionStatus: "FAILED" },
      });
    }
  })();

  return NextResponse.json({ ok: true, status: "GENERATING" });
}
