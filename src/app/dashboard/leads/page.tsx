// lead flow integration v1
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { IntakeLeadStatus } from "@prisma/client";
import Link from "next/link";
import LeadsTable from "./LeadsTable";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<IntakeLeadStatus, string> = {
  NEW: "New",
  INTAKE_SENT: "Intake Sent",
  INTAKE_STARTED: "Started",
  INTAKE_COMPLETE: "Complete",
  VISION_GENERATED: "Vision Ready",
  BID_READY: "Bid Ready",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

type Props = {
  searchParams: Promise<{ status?: string; archived?: string }>;
};

export default async function DashboardLeadsPage({ searchParams }: Props) {
  await requireAdmin("/dashboard/leads");

  const { status, archived } = await searchParams;
  const filterStatus = status as IntakeLeadStatus | undefined;
  const showArchived = archived === "1";

  const leads = await db.intakeLead.findMany({
    where: filterStatus
      ? { status: filterStatus }
      : showArchived
      ? {}
      : { status: { not: "CLOSED" } },
    include: { _count: { select: { assets: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = await db.intakeLead.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const countMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.status]),
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/admin"
            className="inline-block text-white/50 hover:text-white text-xs font-ui font-semibold uppercase tracking-wide mb-3 transition-colors"
          >
            ← Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl">Client Intakes</h1>
              <p className="text-white/60 text-sm mt-1">{leads.length} lead{leads.length !== 1 ? "s" : ""}</p>
            </div>
            <Link
              href="/dashboard/leads/new"
              className="bg-red text-white font-ui font-bold px-6 py-3 rounded-lg hover:bg-red-dark transition-colors"
            >
              + New Client
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <Link
            href="/dashboard/leads"
            className={`px-4 py-2 rounded-full text-sm font-ui font-semibold border transition-colors ${
              !filterStatus && !showArchived ? "bg-charcoal text-white border-charcoal" : "border-gray-warm text-charcoal hover:border-charcoal"
            }`}
          >
            All ({leads.length})
          </Link>
          {(Object.keys(STATUS_LABELS) as IntakeLeadStatus[]).filter((s) => s !== "CLOSED").map((s) => {
            const count = countMap[s] ?? 0;
            if (count === 0) return null;
            return (
              <Link
                key={s}
                href={`/dashboard/leads?status=${s}`}
                className={`px-4 py-2 rounded-full text-sm font-ui font-semibold border transition-colors ${
                  filterStatus === s ? "bg-charcoal text-white border-charcoal" : "border-gray-warm text-charcoal hover:border-charcoal"
                }`}
              >
                {STATUS_LABELS[s]} ({count})
              </Link>
            );
          })}
          <Link
            href={showArchived ? "/dashboard/leads" : "/dashboard/leads?archived=1"}
            className={`px-4 py-2 rounded-full text-sm font-ui font-semibold border transition-colors ml-auto ${
              showArchived ? "bg-charcoal text-white border-charcoal" : "border-gray-warm text-gray-mid hover:border-charcoal hover:text-charcoal"
            }`}
          >
            {showArchived ? "Hide archived" : `Show archived (${countMap["CLOSED"] ?? 0})`}
          </Link>
        </div>

        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  );
}
