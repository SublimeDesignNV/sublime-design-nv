import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import type { IntakeLeadStatus, VisionStatus, Prisma } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const lead = await db.intakeLead.findUnique({
    where: { id },
    include: { assets: { orderBy: { createdAt: "asc" } } },
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const { id } = await params;
  const body = (await request.json()) as {
    status?: IntakeLeadStatus;
    visionStatus?: VisionStatus;
    projectNotes?: string;
    intakeData?: Record<string, unknown>;
  };

  const lead = await db.intakeLead.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.visionStatus !== undefined ? { visionStatus: body.visionStatus } : {}),
      ...(body.projectNotes !== undefined ? { projectNotes: body.projectNotes } : {}),
      ...(body.intakeData !== undefined ? { intakeData: body.intakeData as Prisma.InputJsonValue } : {}),
    },
    include: { assets: true },
  });

  return NextResponse.json({ ok: true, lead });
}
