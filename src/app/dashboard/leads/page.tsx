import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { IntakeLeadStatus } from "@prisma/client";
import Link from "next/link";

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

const STATUS_COLORS: Record<IntakeLeadStatus, string> = {
  NEW: "bg-gray-warm text-charcoal",
  INTAKE_SENT: "bg-blue-50 text-blue-700",
  INTAKE_STARTED: "bg-yellow-50 text-yellow-700",
  INTAKE_COMPLETE: "bg-indigo-50 text-indigo-700",
  VISION_GENERATED: "bg-purple-50 text-purple-700",
  BID_READY: "bg-green-50 text-green-700",
  CONVERTED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-500",
};

const SERVICE_LABELS: Record<string, string> = {
  BARN_DOORS: "Barn Doors",
  CABINETS: "Cabinets",
  CUSTOM_CLOSETS: "Custom Closets",
  FAUX_BEAMS: "Faux Beams",
  FLOATING_SHELVES: "Floating Shelves",
  MANTELS: "Mantels",
  TRIM_WORK: "Trim Work",
  MULTIPLE: "Multiple",
  OTHER: "Other",
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function DashboardLeadsPage({ searchParams }: Props) {
  await requireAdmin("/dashboard/leads");

  const { status } = await searchParams;
  const filterStatus = status as IntakeLeadStatus | undefined;

  const leads = await db.intakeLead.findMany({
    where: filterStatus ? { status: filterStatus } : {},
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/dashboard/leads"
            className={`px-4 py-2 rounded-full text-sm font-ui font-semibold border transition-colors ${
              !filterStatus ? "bg-charcoal text-white border-charcoal" : "border-gray-warm text-charcoal hover:border-charcoal"
            }`}
          >
            All ({leads.length})
          </Link>
          {(Object.keys(STATUS_LABELS) as IntakeLeadStatus[]).map((s) => {
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
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16 text-gray-mid">
            <p className="text-xl mb-4">No leads yet.</p>
            <Link href="/dashboard/leads/new" className="text-red font-ui font-semibold hover:underline">
              Send your first intake link →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-warm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-warm bg-gray-warm/40">
                  <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden sm:table-cell">Service</th>
                  <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden md:table-cell">Created</th>
                  <th className="text-left px-5 py-3 text-xs font-ui font-semibold text-gray-mid uppercase tracking-wide hidden md:table-cell">Assets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-warm">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-warm/20 transition-colors relative">
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="font-ui font-semibold text-charcoal after:absolute after:inset-0"
                      >
                        {lead.firstName} {lead.lastName ?? ""}
                      </Link>
                      {lead.phone && (
                        <p className="text-xs text-gray-mid mt-0.5">{lead.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-charcoal">{SERVICE_LABELS[lead.serviceType] ?? lead.serviceType}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-ui font-semibold ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-mid">
                        {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-mid">{lead._count.assets}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
