import AdminAccessRequired from "@/components/admin/AdminAccessRequired";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import { isAdminSession } from "@/lib/adminAuth";
import { getRecentLeads } from "@/lib/leads";
import { ACTIVE_SERVICES } from "@/content/services";

export const dynamic = "force-dynamic";

function serviceLabel(slug: string) {
  return ACTIVE_SERVICES.find((s) => s.slug === slug)?.shortTitle ?? slug;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    quoted: "bg-purple-50 text-purple-700 border-purple-200",
    closed: "bg-green-50 text-green-700 border-green-200",
    lost: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const cls = colors[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`rounded-full border px-2 py-0.5 font-ui text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default async function AdminLeadsPage() {
  if (!isAdminSession()) {
    return <AdminAccessRequired title="Lead inbox access required" />;
  }

  const leads = await getRecentLeads(50);
  const hasDb = Boolean(process.env.DATABASE_URL);

  return (
    <main className="bg-cream pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-sm uppercase tracking-widest text-red">Admin</p>
            <h1 className="mt-1 text-3xl text-charcoal">Lead Inbox</h1>
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
              <code className="rounded bg-yellow-100 px-1">prisma migrate deploy</code> to enable
              lead persistence. Quote emails are still delivered via Resend.
            </p>
          </div>
        ) : leads.length === 0 ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-mid">No leads yet. Quote requests will appear here.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <p className="font-ui text-xs text-gray-mid">{leads.length} most recent leads</p>

            {leads.map((lead) => (
              <div
                key={lead.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Card header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-cream px-5 py-4">
                  <div>
                    <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                      {serviceLabel(lead.service)} · {lead.location}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold text-charcoal">{lead.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={lead.status} />
                    <p className="font-ui text-xs text-gray-mid">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>

                {/* Card body */}
                <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-3">
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-ui font-semibold text-charcoal">Email: </span>
                      <a href={`mailto:${lead.email}`} className="text-red hover:underline">
                        {lead.email}
                      </a>
                    </p>
                    <p>
                      <span className="font-ui font-semibold text-charcoal">Phone: </span>
                      <a href={`tel:${lead.phone.replace(/\D/g, "")}`} className="text-red hover:underline">
                        {lead.phone}
                      </a>
                    </p>
                    {lead.timeline ? (
                      <p>
                        <span className="font-ui font-semibold text-charcoal">Timeline: </span>
                        <span className="text-gray-mid">{lead.timeline}</span>
                      </p>
                    ) : null}
                    {lead.budget ? (
                      <p>
                        <span className="font-ui font-semibold text-charcoal">Budget: </span>
                        <span className="text-gray-mid">{lead.budget}</span>
                      </p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2">
                    <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Message</p>
                    <p className="mt-1 text-sm leading-6 text-charcoal/80 line-clamp-4">
                      {lead.message}
                    </p>
                  </div>
                </div>

                {lead.photoUrls.length > 0 ? (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                      Photos ({lead.photoUrls.length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lead.photoUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-md border border-gray-200"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Photo ${i + 1}`} className="h-16 w-24 object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Action row */}
                <div className="flex flex-wrap gap-3 border-t border-gray-100 px-5 py-3">
                  <a
                    href={`mailto:${lead.email}?subject=Re: Your ${serviceLabel(lead.service)} Quote Request`}
                    className="font-ui rounded-sm bg-red px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Reply by email
                  </a>
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, "")}`}
                    className="font-ui rounded-sm bg-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
