import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import LeadInbox from "@/components/admin/LeadInbox";
import { requireAdmin } from "@/lib/auth";
import { getLeadSummary, listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdmin("/admin/leads");

  const hasDb = Boolean(process.env.DATABASE_URL);
  const [initialLeads, initialSummary] = hasDb
    ? await Promise.all([listLeads({ status: "ACTIVE" }), getLeadSummary()])
    : [[], { totalActive: 0, newCount: 0, reviewedCount: 0, contactedCount: 0, archivedCount: 0, thisWeekCount: 0 }];

  return (
    <main className="bg-cream pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-sm uppercase tracking-widest text-red">Admin</p>
            <h1 className="mt-1 text-3xl text-charcoal">Lead Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-mid">
              Review new quote submissions, see project and service context, and update lead status without leaving the app.
            </p>
          </div>
          <Link href="/admin" className="font-ui text-sm text-gray-mid hover:text-charcoal">
            ← Admin home
          </Link>
        </div>
        <AdminNav />

        {!hasDb ? (
          <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
            <p className="font-medium text-yellow-800">No database configured</p>
            <p className="mt-1 text-sm text-yellow-700">
              Set <code className="rounded bg-yellow-100 px-1">DATABASE_URL</code> and run{" "}
              <code className="rounded bg-yellow-100 px-1">prisma migrate deploy</code> to enable the lead inbox.
            </p>
          </div>
        ) : (
          <LeadInbox initialLeads={initialLeads} initialSummary={initialSummary} />
        )}
      </div>
    </main>
  );
}
