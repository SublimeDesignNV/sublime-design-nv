import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVision } from "@/lib/ai/generateVision";
import type { Prisma } from "@prisma/client";

// Vercel: 60s timeout — GPT-4o + DALL-E together need up to 40–50s
export const maxDuration = 60;

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

  await db.intakeLead.update({
    where: { id },
    data: { visionStatus: "GENERATING" },
  });

  // Run synchronously within the request — Vercel kills fire-and-forget jobs
  // when the response is sent, so we must await before returning.
  try {
    console.log("[generate-route] calling generateVision");
    const result = await generateVision(lead);
    console.log("[generate-route] generateVision returned, headline:", result.headline);

    if (result.renderUrl) {
      console.log("[generate-route] saving VISION_RENDER asset");
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

    console.log("[generate-route] marked COMPLETE for leadId:", id);
    return NextResponse.json({ ok: true, status: "COMPLETE" });
  } catch (err) {
    console.error("[generate-route] FAILED for leadId:", id);
    console.error("[generate-route] error name:", err instanceof Error ? err.name : typeof err);
    console.error("[generate-route] error message:", err instanceof Error ? err.message : String(err));
    console.error("[generate-route] full error:", err);
    await db.intakeLead.update({
      where: { id },
      data: { visionStatus: "FAILED" },
    });
    return NextResponse.json({ ok: false, status: "FAILED" }, { status: 500 });
  }
}
