import { isAdminSession } from "@/lib/adminAuth";
import { listAssetsByServiceTag } from "@/lib/cloudinary.server";
import { SERVICE_LIST } from "@/content/services";
import { getRepoImageCount } from "@/lib/portfolioContent.server";

export const dynamic = "force-dynamic";

type ServiceAuditRow = {
  slug: string;
  title: string;
  status: string;
  repoCount: number;
  cloudinaryCount: number;
  hasFeatured: boolean;
  hasHeroCandidate: boolean;
};

async function buildAuditRows(): Promise<ServiceAuditRow[]> {
  const rows = await Promise.all(
    SERVICE_LIST.map(async (service) => {
      const repoCount = getRepoImageCount(service.slug);
      const cloudinaryAssets = await listAssetsByServiceTag(service.slug, 50).catch(() => []);
      const cloudinaryCount = cloudinaryAssets.length;
      const hasFeatured = cloudinaryAssets.some(
        (a) =>
          a.tags?.includes("featured") ||
          a.context?.featured?.toLowerCase() === "true",
      );
      const hasHeroCandidate = cloudinaryAssets.some((a) => a.tags?.includes("hero")) || hasFeatured || cloudinaryCount > 0;

      return {
        slug: service.slug,
        title: service.shortTitle,
        status: service.status,
        repoCount,
        cloudinaryCount,
        hasFeatured,
        hasHeroCandidate,
      } satisfies ServiceAuditRow;
    }),
  );
  return rows;
}

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

export default async function ContentAuditPage() {
  const isAuthed = isAdminSession();

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-cream px-4 pt-20 md:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl text-charcoal">Access Denied</h1>
          <p className="mt-3 text-gray-mid">Admin login required.</p>
          <a href="/admin" className="font-ui mt-4 inline-block text-sm font-semibold text-red">
            ← Go to Admin Login
          </a>
        </div>
      </main>
    );
  }

  const rows = await buildAuditRows();
  const totalCloudinary = rows.reduce((s, r) => s + r.cloudinaryCount, 0);
  const totalRepo = rows.reduce((s, r) => s + r.repoCount, 0);
  const readyServices = rows.filter((r) => r.cloudinaryCount > 0).length;

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

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Services", value: rows.length },
            { label: "Ready (Cloudinary)", value: readyServices },
            { label: "Cloudinary Images", value: totalCloudinary },
            { label: "Repo Images", value: totalRepo },
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
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Service
                </th>
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Status
                </th>
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Cloudinary
                </th>
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Repo
                </th>
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Featured
                </th>
                <th className="px-4 py-3 font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Hero Ready
                </th>
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
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span
                      className={
                        row.cloudinaryCount === 0
                          ? "text-red-600"
                          : row.cloudinaryCount < 3
                            ? "text-yellow-600"
                            : "text-green-700"
                      }
                    >
                      {row.cloudinaryCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-charcoal">{row.repoCount}</td>
                  <td className="px-4 py-3">
                    <Badge ok={row.hasFeatured} label={row.hasFeatured ? "yes" : "no"} />
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
          Cloudinary counts images tagged service:&lt;slug&gt; (up to 50). Repo counts local files
          in content/portfolio/&lt;slug&gt;/. Run{" "}
          <code className="rounded bg-gray-100 px-1">npm run portfolio:upload</code> to push repo
          images to Cloudinary.
        </p>
      </div>
    </main>
  );
}
