import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// Public route — returns limited lead fields needed to render the intake form
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const lead = await db.intakeLead.findUnique({
    where: { token },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      serviceType: true,
      status: true,
      visionStatus: true,
      assets: {
        select: {
          id: true,
          type: true,
          url: true,
          caption: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

// Called by intake form to submit completed intake data
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const lead = await db.intakeLead.findUnique({ where: { token } });
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    intakeData?: Record<string, unknown>;
    status?: "INTAKE_STARTED" | "INTAKE_COMPLETE";
    assets?: { type: string; url: string; caption?: string }[];
  };

  await db.intakeLead.update({
    where: { token },
    data: {
      ...(body.intakeData !== undefined ? { intakeData: body.intakeData as Prisma.InputJsonValue } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });

  if (body.assets && body.assets.length > 0) {
    await db.intakeLeadAsset.createMany({
      data: body.assets.map((a) => ({
        leadId: lead.id,
        type: a.type as Parameters<typeof db.intakeLeadAsset.create>[0]["data"]["type"],
        url: a.url,
        caption: a.caption,
      })),
    });
  }

  const updated = await db.intakeLead.findUnique({
    where: { token },
    select: { id: true, status: true, visionStatus: true },
  });

  return NextResponse.json({ ok: true, lead: updated });
}
