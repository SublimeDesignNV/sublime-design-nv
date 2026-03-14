import AdminAccessRequired from "@/components/admin/AdminAccessRequired";
import AdminNav from "@/components/admin/AdminNav";
import { isAdminSession } from "@/lib/adminAuth";
import {
  getFlagshipProjectAuditRows,
  getServiceContentAuditRows,
} from "@/lib/contentAudit.server";

export const dynamic = "force-dynamic";

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-xs ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
      }`}
    >
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-mono text-xs ${
        status === "active" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

function CountTone({ count }: { count: number }) {
  return (
    <span
      className={
        count === 0
          ? "font-mono text-red-600"
          : count < 3
            ? "font-mono text-yellow-600"
            : "font-mono text-green-700"
      }
    >
      {count}
    </span>
  );
}

function CoverageBadge({ status }: { status: "empty" | "thin" | "healthy" }) {
  const styles =
    status === "healthy"
      ? "bg-green-100 text-green-800"
      : status === "thin"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-700";

  return (
    <span className={`inline-block rounded px-2 py-0.5 font-mono text-xs ${styles}`}>
      {status}
    </span>
  );
}

function SourceBadge({ source }: { source: "cloudinary" | "seed" | "mixed" | "empty" }) {
  const styles =
    source === "cloudinary"
      ? "bg-green-100 text-green-800"
      : source === "mixed"
        ? "bg-yellow-100 text-yellow-800"
        : source === "seed"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-700";

  return <span className={`inline-block rounded px-2 py-0.5 font-mono text-xs ${styles}`}>{source}</span>;
}

export default async function ContentAuditPage() {
  const isAuthed = isAdminSession();

  if (!isAuthed) {
    return <AdminAccessRequired title="Content audit access required" />;
  }

  const rows = await getServiceContentAuditRows();
  const flagshipRows = await getFlagshipProjectAuditRows();
  const totalCloudinary = rows.reduce((sum, row) => sum + row.cloudinaryCount, 0);
  const totalSeed = rows.reduce((sum, row) => sum + row.seedCount, 0);
  const readyServices = rows.filter((row) => row.actualImageCount > 0).length;
  const heroReadyServices = rows.filter((row) => row.hasHeroCandidate).length;
  const healthyServices = rows.filter((row) => row.coverageStatus === "healthy").length;

  return (
    <main className="min-h-screen bg-cream px-4 pb-20 pt-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="font-ui text-sm font-semibold text-red">
          ← Admin
        </a>
        <h1 className="mt-4 text-4xl text-charcoal">Content Audit</h1>
        <p className="font-ui mt-2 text-sm text-gray-mid">
          Portfolio readiness by service category.
        </p>
        <AdminNav />

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Services", value: rows.length },
            { label: "Has Content", value: readyServices },
            { label: "Hero Ready", value: heroReadyServices },
            { label: "Healthy", value: healthyServices },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-mono text-3xl text-charcoal">{value}</p>
              <p className="font-ui mt-1 text-xs uppercase tracking-widest text-gray-mid">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {[
                  "Service",
                  "Status",
                  "Cloudinary",
                  "Repo",
                  "Seed",
                  "Target",
                  "Actual",
                  "Completion",
                  "Coverage",
                  "Featured",
                  "Hero Ready",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <a
                      href={`/services/${row.slug}`}
                      className="font-medium text-charcoal hover:text-red"
                    >
                      {row.title}
                    </a>
                    <p className="font-mono text-xs text-gray-mid">{row.slug}</p>
                    {row.notes.length ? (
                      <p className="mt-1 font-ui text-xs text-red">{row.notes.join(" · ")}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <CountTone count={row.cloudinaryCount} />
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.repoCount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.seedCount > 0
                          ? "font-mono text-blue-700"
                          : "font-mono text-gray-mid"
                      }
                    >
                      {row.seedCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.targetImageCount}</td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.actualImageCount}</td>
                  <td className="px-4 py-3 font-mono text-charcoal">
                    {row.completionPercentage}%
                  </td>
                  <td className="px-4 py-3">
                    <CoverageBadge status={row.coverageStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      ok={row.hasFeaturedImage}
                      label={row.hasFeaturedImage ? "yes" : "no"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      ok={row.hasHeroCandidate}
                      label={row.hasHeroCandidate ? "yes" : "no"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-mono text-xs text-gray-mid">
          Cloudinary total: {totalCloudinary} · Seed total: {totalSeed} ·
          {" "}
          Cloudinary: images tagged{" "}
          <code className="rounded bg-gray-100 px-1">service:&lt;slug&gt;</code> (max 50) ·
          Repo: files in{" "}
          <code className="rounded bg-gray-100 px-1">content/portfolio/&lt;slug&gt;/</code> ·
          Seed: files in{" "}
          <code className="rounded bg-gray-100 px-1">public/seed-images/&lt;slug&gt;/</code> ·
          Run <code className="rounded bg-gray-100 px-1">npm run portfolio:upload</code> to push
          repo images to Cloudinary.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-xl text-charcoal">Flagship Content Readiness</h2>
            <p className="mt-1 text-sm text-gray-mid">
              Quick quality check for the top proof pages that should carry rankings and quote intent.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {[
                  "Project",
                  "Location",
                  "Images",
                  "Target",
                  "Gallery",
                  "Source",
                  "Has Location",
                  "Hero",
                  "Hero Source",
                  "Linked Review",
                  "Proof",
                  "CTA",
                  "Summary",
                  "Before/After",
                  "Real-World",
                  "Rich Content",
                  "OG Ready",
                  "Share Ready",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flagshipRows.map((row) => (
                <tr key={row.slug} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{row.title}</p>
                    <p className="font-mono text-xs text-gray-mid">{row.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{row.location}</td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.imageCount}</td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.targetImageCount}</td>
                  <td className="px-4 py-3"><CoverageBadge status={row.galleryStatus} /></td>
                  <td className="px-4 py-3">
                    <SourceBadge
                      source={
                        row.imageCount === 0
                          ? "empty"
                          : row.usingSeedFallback && row.heroFromCloudinary
                            ? "mixed"
                            : row.usingSeedFallback
                              ? "seed"
                              : "cloudinary"
                      }
                    />
                  </td>
                  <td className="px-4 py-3"><Badge ok={row.hasLocation} label={row.hasLocation ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasHeroImage} label={row.hasHeroImage ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.heroFromCloudinary} label={row.heroFromCloudinary ? "cloud" : "seed"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasLinkedReview} label={row.hasLinkedReview ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasReviewOrTestimonial} label={row.hasReviewOrTestimonial ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasStrongCtaLine} label={row.hasStrongCtaLine ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasProjectSummary} label={row.hasProjectSummary ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasBeforeAfterContent} label={row.hasBeforeAfterContent ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasRealWorldContent} label={row.hasRealWorldContent ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasRichContent} label={row.hasRichContent ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasOgReadyMetadata} label={row.hasOgReadyMetadata ? "yes" : "no"} /></td>
                  <td className="px-4 py-3"><Badge ok={row.hasShareReadyMetadataInputs} label={row.hasShareReadyMetadataInputs ? "yes" : "no"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-mono text-xs text-gray-mid">
          Flagship rows highlight where real proof is still thin: image totals, gallery health,
          hero source, seed fallback usage, linked review coverage, and richer before/after content.
        </p>
      </div>
    </main>
  );
}
