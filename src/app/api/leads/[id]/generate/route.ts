import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVision } from "@/lib/ai/generateVision";
import type { Prisma } from "@prisma/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const lead = await db.intakeLead.findUnique({
    where: { id },
    include: { assets: true },
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  // Immediately mark as GENERATING and return — actual work happens async
  await db.intakeLead.update({
    where: { id },
    data: { visionStatus: "GENERATING" },
  });

  // Fire-and-forget background generation
  void (async () => {
    try {
      const result = await generateVision(lead);

      // If there's a render URL, save it as a VISION_RENDER asset
      if (result.renderUrl) {
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
    } catch (err) {
      console.error("[generate-vision] Failed:", err);
      await db.intakeLead.update({
        where: { id },
        data: { visionStatus: "FAILED" },
      });
    }
  })();

  return NextResponse.json({ ok: true, status: "GENERATING" });
}
