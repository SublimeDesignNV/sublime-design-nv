import { LeadClassification, LeadStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { getLeadSummary, listLeads } from "@/lib/leads";

function parseLeadStatus(value: string | null) {
  if (!value) return undefined;
  if (value === "ACTIVE" || value === "ALL") return value;
  return Object.values(LeadStatus).includes(value as LeadStatus)
    ? (value as LeadStatus)
    : undefined;
}

function parseLeadClassification(value: string | null) {
  if (!value) return undefined;
  return Object.values(LeadClassification).includes(value as LeadClassification)
    ? (value as LeadClassification)
    : undefined;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || undefined;
  const sourceType = url.searchParams.get("sourceType")?.trim() || undefined;
  const service = url.searchParams.get("service")?.trim() || undefined;
  const classification = parseLeadClassification(url.searchParams.get("classification"));
  const timeframeValue = url.searchParams.get("timeframe");
  const timeframe =
    timeframeValue === "today" || timeframeValue === "week" ? timeframeValue : undefined;
  const archived = url.searchParams.get("archived") === "true";
  const stale = url.searchParams.get("stale") === "true";
  const followUpDue = url.searchParams.get("followUpDue") === "true";
  const status = parseLeadStatus(url.searchParams.get("status"));

  const [leads, summary] = await Promise.all([
    listLeads({ q, status, classification, sourceType, service, timeframe, archived, stale, followUpDue }),
    getLeadSummary(),
  ]);

  return NextResponse.json({ ok: true, leads, summary });
}
