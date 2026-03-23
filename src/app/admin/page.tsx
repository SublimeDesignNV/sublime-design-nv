import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { getLeadSummary, listLeads } from "@/lib/leads";
import {
  listAdminProjects,
  listRenderableOrphanAssets,
  listUploadBatchSummaries,
} from "@/lib/projectRecords.server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin("/admin");

  const [uploadBatches, unlinkedPhotos, projects, leadSummary, recentLeads] = await Promise.all([
    listUploadBatchSummaries({ uploadedSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }),
    listRenderableOrphanAssets({
      linked: false,
      uploadedSince: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    }),
    listAdminProjects(),
    getLeadSummary(),
    listLeads({ status: "ACTIVE", take: 5 }),
  ]);

  const draftProjects = projects.filter((project) => project.status === "DRAFT").length;
  const readyProjects = projects.filter((project) => project.status === "READY").length;
  const publishedProjects = projects.filter((project) => project.status === "PUBLISHED").length;
  const recentBatches = uploadBatches.slice(0, 3);
  const recentLeadRows = recentLeads.slice(0, 4);
  const quickActions = [
    {
      href: "/admin/uploads",
      title: "Upload Photos",
      description: "Upload a new batch, review thumbnails, and turn that batch into a project.",
    },
    {
      href: "/admin/photos/unlinked",
      title: "Review Unlinked Photos",
      description: "Fix photos that are visible but still missing project linkage.",
    },
    {
      href: "/admin/projects",
      title: "Manage Projects",
      description: "Edit details, choose covers, reorder photos, and control publishing.",
    },
    {
      href: "/admin/leads",
      title: "Review Leads",
      description: "Follow up on new inquiries, stale leads, and due reminders.",
    },
  ];

  return (
    <main className="bg-cream px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mt-8 text-4xl text-charcoal">Portfolio Admin</h1>
        <p className="font-ui mt-3 text-sm text-gray-mid">
          Choose the task you need right now, then jump into a focused workspace for uploads, unlinked photos, projects, or leads.
        </p>
        <AdminNav />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-warm bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Recent upload batches</p>
            <p className="mt-3 text-3xl text-charcoal">{uploadBatches.length}</p>
            <p className="mt-2 text-sm text-gray-mid">Batches uploaded in the last week.</p>
          </div>
          <div className="rounded-xl border border-gray-warm bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Unlinked photos</p>
            <p className="mt-3 text-3xl text-charcoal">{unlinkedPhotos.length}</p>
            <p className="mt-2 text-sm text-gray-mid">Renderable photos still waiting for project linkage.</p>
          </div>
          <div className="rounded-xl border border-gray-warm bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Projects</p>
            <p className="mt-3 text-3xl text-charcoal">{projects.length}</p>
            <p className="mt-2 text-sm text-gray-mid">
              {draftProjects} draft, {readyProjects} ready, {publishedProjects} published.
            </p>
          </div>
          <div className="rounded-xl border border-gray-warm bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">Active leads</p>
            <p className="mt-3 text-3xl text-charcoal">{leadSummary.totalActive}</p>
            <p className="mt-2 text-sm text-gray-mid">
              {leadSummary.newCount} new, {leadSummary.staleCount} stale, {leadSummary.followUpDueCount} due follow-up.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-gray-warm bg-white p-6 shadow-sm">
            <h2 className="text-2xl text-charcoal">Quick Actions</h2>
            <p className="mt-2 font-ui text-sm text-gray-mid">
              Start in the workspace that matches the job you need to finish.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-xl border border-gray-200 bg-cream/40 p-4 transition hover:border-red"
                >
                  <p className="font-ui text-xs uppercase tracking-[0.18em] text-red">Open workspace</p>
                  <h3 className="mt-2 text-lg text-charcoal">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-mid">{action.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-warm bg-white p-6 shadow-sm">
            <h2 className="text-2xl text-charcoal">Recent Leads</h2>
            <p className="mt-2 font-ui text-sm text-gray-mid">
              A quick check on what still needs a response.
            </p>
            <div className="mt-5 space-y-3">
              {recentLeadRows.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-gray-200 bg-cream/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-ui text-sm font-semibold text-charcoal">{lead.name}</p>
                      <p className="mt-1 text-xs text-gray-mid">
                        {lead.service || "General inquiry"} • {lead.sourceType || "direct-quote"}
                      </p>
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                      {lead.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-mid">{lead.message}</p>
                </div>
              ))}
              {!recentLeadRows.length ? (
                <p className="font-ui text-sm text-gray-mid">No recent leads yet.</p>
              ) : null}
            </div>
            <Link href="/admin/leads" className="mt-5 inline-flex rounded-sm border border-gray-warm px-4 py-2 font-ui text-sm text-charcoal">
              Open Lead Inbox
            </Link>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-warm bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl text-charcoal">Recent Upload Batches</h2>
                <p className="mt-2 font-ui text-sm text-gray-mid">
                  The newest upload sessions that are ready to become projects.
                </p>
              </div>
              <Link href="/admin/uploads" className="font-ui text-sm text-gray-mid hover:text-charcoal">
                Open uploads →
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {recentBatches.map((batch) => (
                <div key={batch.uploadBatchId} className="rounded-lg border border-gray-200 bg-cream/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-ui text-sm font-semibold text-charcoal">
                        Batch {batch.uploadBatchId.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-gray-mid">
                        {batch.assetCount} photo{batch.assetCount === 1 ? "" : "s"} • {batch.status} • updated{" "}
                        {new Date(batch.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/uploads?batch=${batch.uploadBatchId}`}
                      className="rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
              {!recentBatches.length ? (
                <p className="font-ui text-sm text-gray-mid">No recent upload batches yet.</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-gray-warm bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl text-charcoal">Unlinked Photo Cleanup</h2>
                <p className="mt-2 font-ui text-sm text-gray-mid">
                  Photos that still need project linkage before they can show up in grouped work.
                </p>
              </div>
              <Link href="/admin/photos/unlinked" className="font-ui text-sm text-gray-mid hover:text-charcoal">
                Open cleanup →
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {unlinkedPhotos.slice(0, 4).map((photo) => (
                <div key={photo.id} className="rounded-lg border border-gray-200 bg-cream/40 p-4">
                  <div className="flex items-center gap-3">
                    {photo.imageUrl || photo.thumbnailUrl ? (
                      <img
                        src={photo.imageUrl || photo.thumbnailUrl || ""}
                        alt={photo.title || "Unlinked photo"}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                        No photo
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-ui text-sm font-semibold text-charcoal">
                        {photo.title || "Untitled photo"}
                      </p>
                      <p className="mt-1 text-xs text-gray-mid">
                        {photo.primaryServiceSlug || "No service"} • {photo.diagnosis}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!unlinkedPhotos.length ? (
                <p className="font-ui text-sm text-gray-mid">No unlinked photos need cleanup right now.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
