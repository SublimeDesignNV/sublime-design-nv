import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { VisionResult } from "@/lib/ai/generateVision";
import VisionCard from "./VisionCard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ leadId: string }>;
};

export default async function VisionPage({ params }: Props) {
  const { leadId } = await params;

  const lead = await db.intakeLead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      firstName: true,
      visionStatus: true,
      visionResult: true,
      assets: {
        where: { type: "VISION_RENDER" },
        select: { url: true },
        take: 1,
      },
    },
  });

  if (!lead) notFound();

  return (
    <VisionCard
      initial={{
        id: lead.id,
        firstName: lead.firstName,
        visionStatus: lead.visionStatus as "PENDING" | "GENERATING" | "COMPLETE" | "FAILED",
        visionResult: lead.visionResult as VisionResult | null,
        renderUrl: lead.assets[0]?.url ?? null,
      }}
    />
  );
}
