import { LeadStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { getLeadById, updateLead } from "@/lib/leads";

type UpdateLeadBody = {
  status?: LeadStatus;
  internalNotes?: string;
  contactedVia?: string | null;
  lastContactedAt?: string | null;
  followUpAt?: string | null;
};

function parseLeadStatus(value: unknown) {
  return typeof value === "string" && Object.values(LeadStatus).includes(value as LeadStatus)
    ? (value as LeadStatus)
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
  const internalNotes =
    typeof body.internalNotes === "string" ? body.internalNotes.trim().slice(0, 4000) : undefined;
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
    internalNotes === undefined &&
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
    internalNotes: internalNotes === undefined ? undefined : internalNotes,
    contactedVia: contactedVia === undefined ? undefined : contactedVia,
    lastContactedAt,
    followUpAt,
  });

  if (!lead) {
    return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}
