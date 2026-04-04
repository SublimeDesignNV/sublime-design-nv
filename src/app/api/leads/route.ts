import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import type { IntakeServiceType, IntakeLeadStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as IntakeLeadStatus | null;
  const serviceType = searchParams.get("serviceType") as IntakeServiceType | null;

  const leads = await db.intakeLead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(serviceType ? { serviceType } : {}),
    },
    include: { assets: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, leads });
}

export async function POST(request: Request) {
  const session = await requireAdminApiSession();
  if (!session) return unauthorizedResponse();

  const body = (await request.json()) as {
    firstName: string;
    lastName?: string;
    phone?: string;
    email?: string;
    serviceType: IntakeServiceType;
    projectNotes?: string;
  };

  if (!body.firstName || !body.serviceType) {
    return NextResponse.json(
      { ok: false, error: "firstName and serviceType are required" },
      { status: 400 },
    );
  }

  if (!body.phone && !body.email) {
    return NextResponse.json(
      { ok: false, error: "At least one of phone or email is required" },
      { status: 400 },
    );
  }

  const lead = await db.intakeLead.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      serviceType: body.serviceType,
      projectNotes: body.projectNotes,
    },
  });

  return NextResponse.json({ ok: true, lead }, { status: 201 });
}
