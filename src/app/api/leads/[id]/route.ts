import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import type { IntakeLeadStatus, IntakeServiceType, VisionStatus, Prisma } from "@prisma/client";

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
    projectNotes?: string | null;
    intakeData?: Record<string, unknown>;
    firstName?: string;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    serviceType?: IntakeServiceType;
  };

  const lead = await db.intakeLead.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.visionStatus !== undefined ? { visionStatus: body.visionStatus } : {}),
      ...(body.projectNotes !== undefined ? { projectNotes: body.projectNotes } : {}),
      ...(body.intakeData !== undefined ? { intakeData: body.intakeData as Prisma.InputJsonValue } : {}),
      ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
      ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.serviceType !== undefined ? { serviceType: body.serviceType } : {}),
    },
    include: { assets: true },
  });

  return NextResponse.json({ ok: true, lead });
}
