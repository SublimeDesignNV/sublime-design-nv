import { LeadClassification, LeadStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { deleteLead, getLeadById, updateLead } from "@/lib/leads";

type UpdateLeadBody = {
  status?: LeadStatus;
  classification?: LeadClassification;
  internalNotes?: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  location?: string;
  message?: string;
  contactedVia?: string | null;
  lastContactedAt?: string | null;
  followUpAt?: string | null;
};

function parseLeadStatus(value: unknown) {
  return typeof value === "string" && Object.values(LeadStatus).includes(value as LeadStatus)
    ? (value as LeadStatus)
    : undefined;
}

function parseLeadClassification(value: unknown) {
  return typeof value === "string" && Object.values(LeadClassification).includes(value as LeadClassification)
    ? (value as LeadClassification)
    : undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  void request;
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  const lead = await getLeadById(params.id);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  const body = (await request.json().catch(() => ({}))) as UpdateLeadBody;
  const status = parseLeadStatus(body.status);
  const classification = parseLeadClassification(body.classification);
  const internalNotes =
    typeof body.internalNotes === "string" ? body.internalNotes.trim().slice(0, 4000) : undefined;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : undefined;
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 50) : undefined;
  const service = typeof body.service === "string" ? body.service.trim().slice(0, 100) : undefined;
  const location = typeof body.location === "string" ? body.location.trim().slice(0, 200) : undefined;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 10000) : undefined;
  const contactedVia =
    body.contactedVia === null
      ? null
      : typeof body.contactedVia === "string" &&
          ["email", "phone", "sms", "other"].includes(body.contactedVia)
        ? body.contactedVia
        : undefined;
  const lastContactedAt =
    body.lastContactedAt === null
      ? null
      : typeof body.lastContactedAt === "string"
        ? new Date(body.lastContactedAt)
        : undefined;
  const followUpAt =
    body.followUpAt === null
      ? null
      : typeof body.followUpAt === "string"
        ? new Date(body.followUpAt)
        : undefined;

  if (lastContactedAt instanceof Date && Number.isNaN(lastContactedAt.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid lastContactedAt value." }, { status: 400 });
  }
  if (followUpAt instanceof Date && Number.isNaN(followUpAt.getTime())) {
    return NextResponse.json({ ok: false, error: "Invalid followUpAt value." }, { status: 400 });
  }

  if (
    !status &&
    !classification &&
    internalNotes === undefined &&
    name === undefined &&
    email === undefined &&
    phone === undefined &&
    service === undefined &&
    location === undefined &&
    message === undefined &&
    contactedVia === undefined &&
    lastContactedAt === undefined &&
    followUpAt === undefined
  ) {
    return NextResponse.json(
      { ok: false, error: "Nothing to update." },
      { status: 400 },
    );
  }

  const lead = await updateLead(params.id, {
    status,
    classification,
    internalNotes: internalNotes === undefined ? undefined : internalNotes,
    name,
    email,
    phone,
    service,
    location,
    message,
    contactedVia: contactedVia === undefined ? undefined : contactedVia,
    lastContactedAt,
    followUpAt,
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  void request;
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  const deleted = await deleteLead(params.id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
