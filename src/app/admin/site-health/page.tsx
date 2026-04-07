import Link from "next/link";
import { isAdminAuthConfigured, requireAdmin } from "@/lib/auth";
import {
  getAreaContentAuditRows,
  getLaunchReadinessSummary,
  getPromotionReadySummary,
  getServiceContentAuditRows,
} from "@/lib/contentAudit.server";
import { SOCIAL_ENABLED } from "@/lib/social/config";

export const dynamic = "force-dynamic";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Check({
  ok,
  label,
  fixHref,
  fixLabel,
}: {
  ok: boolean;
  label: string;
  fixHref?: string;
  fixLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
        {ok ? "✓" : "✗"}
      </span>
      <span className="flex-1 text-sm text-charcoal">{label}</span>
      {!ok && fixHref ? (
        <a href={fixHref} target="_blank" rel="noreferrer" className="shrink-0 font-ui text-xs text-navy hover:text-red">
          {fixLabel ?? "Fix →"}
        </a>
      ) : null}
    </div>
  );
}

// ─── Tab nav ─────────────────────────────────────────────────────────────────

function TabNav({ active }: { active: string }) {
  const tabs = [
    { id: "config", label: "Config" },
    { id: "content", label: "Content" },
    { id: "seo", label: "SEO" },
    { id: "social", label: "Social" },
  ];
  return (
    <div className="flex gap-1 border-b border-gray-warm">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/admin/site-health?tab=${tab.id}`}
          className={`px-5 py-2.5 font-ui text-xs uppercase tracking-[0.14em] transition ${
            active === tab.id
              ? "border-b-2 border-navy text-navy"
              : "text-gray-mid hover:text-charcoal"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SiteHealthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin("/admin/site-health");
  const { tab = "config" } = await searchParams;

  // Env checks (used in Config tab)
  const hasGa = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasCloudinary =
    Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) &&
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasAdminLogin = isAdminAuthConfigured();
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  const configChecks = [hasGa, hasResend, hasCloudinary, hasDb, hasAdminLogin, hasSiteUrl];
  const configScore = configChecks.filter(Boolean).length;

  const [summary, serviceRows, areaRows, promotionReady] = await Promise.all([
    getLaunchReadinessSummary(),
    getServiceContentAuditRows(),
    getAreaContentAuditRows(),
    getPromotionReadySummary(),
  ]);

  const contentChecks = [
    summary.thresholds.hasSixActiveServices,
    summary.thresholds.hasSixProjects,
    summary.thresholds.hasThreeFlagshipOrFeaturedProjects,
    summary.thresholds.hasOneHeroCandidate,
  ];
  const contentScore = contentChecks.filter(Boolean).length;
  const areaReadyCount = areaRows.filter((r) => r.readinessStatus === "launch-ready").length;
  const totalChecks = configChecks.length + contentChecks.length;
  const totalPassing = configScore + contentScore;
  const healthPct = Math.round((totalPassing / totalChecks) * 100);

  const servicesWithContent = serviceRows.filter((r) => r.cloudinaryCount > 0).length;

  return (
    <main className="bg-cream px-4 pb-20 pt-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mt-8 text-4xl text-charcoal">Site Health</h1>

        {/* Summary bar */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-warm bg-white p-4">
            <p className="font-ui text-2xl font-semibold text-charcoal">{configScore}/{configChecks.length}</p>
            <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Config Ready</p>
          </div>
          <div className="rounded-xl border border-gray-warm bg-white p-4">
            <p className="font-ui text-2xl font-semibold text-charcoal">{contentScore}/{contentChecks.length}</p>
            <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Content Ready</p>
          </div>
          <div className="rounded-xl border border-gray-warm bg-white p-4">
            <p className="font-ui text-2xl font-semibold text-charcoal">{areaReadyCount}</p>
            <p className="mt-1 font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Area Pages Ready</p>
          </div>
        </div>

        {/* Health score */}
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-warm bg-white px-4 py-3">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-ui text-xs uppercase tracking-[0.14em] text-gray-mid">Site Health Score</p>
              <p className="font-ui text-sm font-semibold text-charcoal">{healthPct}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${healthPct >= 80 ? "bg-green-500" : healthPct >= 50 ? "bg-amber-400" : "bg-red"}`}
                style={{ width: `${healthPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 rounded-xl border border-gray-warm bg-white">
          <div className="px-5 pt-4">
            <TabNav active={tab} />
          </div>

          <div className="px-5 pb-6 pt-5">
            {/* ── CONFIG TAB ─────────────────────────────── */}
            {tab === "config" ? (
              <div className="space-y-6">
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Integrations</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    <Check ok={hasResend} label="Resend email" />
                    <Check ok={hasCloudinary} label="Cloudinary" />
                    <Check ok={hasDb} label="Database" />
                    <Check ok={hasAdminLogin} label="Admin login" />
                    <Check
                      ok={hasSiteUrl}
                      label={hasSiteUrl ? `Site URL: ${process.env.NEXT_PUBLIC_SITE_URL}` : "NEXT_PUBLIC_SITE_URL not set"}
                      fixLabel="Set in Vercel →"
                      fixHref="https://vercel.com/dashboard"
                    />
                    <Check
                      ok={hasGa}
                      label={hasGa ? `GA4: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}` : "Google Analytics not configured"}
                      fixLabel="Create GA4 property →"
                      fixHref="https://analytics.google.com"
                    />
                  </div>
                </div>

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Content Readiness</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    <Check ok={summary.thresholds.hasSixActiveServices} label={`${summary.activeServices} active services${summary.thresholds.hasSixActiveServices ? "" : " (need 6)"}`} />
                    <Check ok={summary.thresholds.hasSixProjects} label={`${summary.totalProjects} projects${summary.thresholds.hasSixProjects ? "" : " (need 6)"}`} />
                    <Check ok={summary.thresholds.hasThreeFlagshipOrFeaturedProjects} label={`${summary.flagshipOrFeaturedProjects} flagship/featured projects${summary.thresholds.hasThreeFlagshipOrFeaturedProjects ? "" : " (need 3)"}`} />
                    <Check ok={summary.thresholds.hasOneHeroCandidate} label={`${summary.servicesWithHeroCandidate} hero-ready service${summary.servicesWithHeroCandidate === 1 ? "" : "s"}${summary.thresholds.hasOneHeroCandidate ? "" : " (need 1)"}`} />
                  </div>
                </div>

                {areaReadyCount > 0 ? (
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Area Pages Ready to Publish</p>
                    <div className="mt-2 flex flex-wrap gap-2 pt-1">
                      {areaRows.filter((r) => r.readinessStatus === "launch-ready").map((area) => (
                        <a key={area.slug} href={`/areas/${area.slug}`} target="_blank" className="rounded-sm border border-green-200 bg-green-50 px-3 py-1 font-ui text-xs text-green-700 hover:border-green-400">
                          {area.name} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Quick Links</p>
                  <div className="mt-2 flex flex-wrap gap-2 pt-1">
                    {[
                      { label: "Lead Inbox", href: "/admin/leads" },
                      { label: "Content Audit", href: "/admin/site-health?tab=content" },
                      { label: "sitemap.xml", href: "/sitemap.xml", external: true },
                      { label: "robots.txt", href: "/robots.txt", external: true },
                      { label: "Quote form", href: "/quote", external: true },
                    ].map(({ label, href, external }) => (
                      <a
                        key={label}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy"
                      >
                        {label}{external ? " ↗" : ""}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ── CONTENT TAB ────────────────────────────── */}
            {tab === "content" ? (
              <div className="space-y-6">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Portfolio Health</p>
                    <p className="font-ui text-xs text-charcoal">{servicesWithContent} of {serviceRows.length} services have photos</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-navy transition-all"
                      style={{ width: `${Math.round((servicesWithContent / serviceRows.length) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Service list */}
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Services</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    {serviceRows.map((row) => {
                      const hasPhotos = row.cloudinaryCount > 0;
                      const statusColor = row.readinessStatus === "launch-ready"
                        ? "text-green-700 bg-green-50 border-green-200"
                        : row.readinessStatus === "improving"
                          ? "text-amber-700 bg-amber-50 border-amber-200"
                          : "text-gray-mid bg-gray-50 border-gray-200";
                      return (
                        <div key={row.slug} className="flex items-center gap-3 py-2.5">
                          <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${hasPhotos ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {hasPhotos ? "✓" : "✗"}
                          </span>
                          <a href={`/services/${row.slug}`} className="flex-1 text-sm font-medium text-charcoal hover:text-red">
                            {row.title}
                          </a>
                          <span className={`rounded-full border px-2 py-0.5 font-ui text-[10px] uppercase tracking-[0.14em] ${statusColor}`}>
                            {row.readinessStatus === "launch-ready" ? "ready" : row.readinessStatus}
                          </span>
                          <span className="w-24 text-right font-ui text-xs text-gray-mid">
                            {row.cloudinaryCount} photo{row.cloudinaryCount === 1 ? "" : "s"} · {row.linkedProjectCount} project{row.linkedProjectCount === 1 ? "" : "s"}
                          </span>
                          <Link
                            href={`/admin/uploads`}
                            className="font-ui text-xs text-navy hover:text-red"
                          >
                            Upload →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Promotion ready */}
                {(promotionReady.projects.length > 0 || promotionReady.services.length > 0 || promotionReady.areas.length > 0) ? (
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Ready to Promote</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Projects", items: promotionReady.projects.map((r) => ({ slug: r.slug, name: r.title })) },
                        { label: "Services", items: promotionReady.services.map((r) => ({ slug: r.slug, name: r.title })) },
                        { label: "Areas", items: promotionReady.areas.map((r) => ({ slug: r.slug, name: r.name })) },
                      ].map(({ label, items }) => (
                        <div key={label}>
                          <p className="font-ui text-xs text-red">{label}</p>
                          {items.length ? (
                            <ul className="mt-1 space-y-1">
                              {items.map((item) => <li key={item.slug} className="font-ui text-xs text-charcoal">{item.name}</li>)}
                            </ul>
                          ) : (
                            <p className="mt-1 font-ui text-xs text-gray-mid">None yet</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Area list */}
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Area Pages</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    {areaRows.map((row) => {
                      const isReady = row.readinessStatus === "launch-ready";
                      return (
                        <div key={row.slug} className="flex items-center gap-3 py-2.5">
                          <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isReady ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {isReady ? "✓" : "~"}
                          </span>
                          <a href={`/areas/${row.slug}`} className="flex-1 text-sm font-medium text-charcoal hover:text-red">{row.name}</a>
                          <span className="font-ui text-xs text-gray-mid">{row.linkedProjectCount} projects · {row.readinessScore}/{row.readinessMaxScore}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ── SEO TAB ────────────────────────────────── */}
            {tab === "seo" ? (
              <div className="space-y-6">
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Technical SEO</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    <Check ok label="Sitemap auto-generated at /sitemap.xml" />
                    <Check ok label="robots.txt served at /robots.txt" />
                    <Check ok={hasSiteUrl} label="Canonical metadataBase configured" fixHref="https://vercel.com/dashboard" fixLabel="Set NEXT_PUBLIC_SITE_URL →" />
                    <Check ok={hasGa} label="GA4 tracking active" fixHref="https://analytics.google.com" fixLabel="Create GA4 property →" />
                  </div>
                </div>

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Thin Page Guardrails</p>
                  <p className="mt-2 text-sm text-gray-mid">
                    Pages below content density thresholds qualify for noindex until proof improves.
                    This prevents thin pages from diluting the site&#39;s authority in search.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: "Services with noindex", count: serviceRows.filter((r) => r.shouldNoindex).length },
                    ].map(({ label, count }) => (
                      <div key={label} className={`rounded-sm border px-3 py-1.5 font-ui text-xs ${count === 0 ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                        {count} {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Pages to Promote</p>
                  <p className="mt-2 text-sm text-gray-mid">
                    Launch-ready pages worth sharing and building links to.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {areaRows.filter((r) => r.readinessStatus === "launch-ready").map((area) => (
                      <a key={area.slug} href={`/areas/${area.slug}`} target="_blank" rel="noreferrer" className="rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal hover:border-navy hover:text-navy">
                        /areas/{area.slug} ↗
                      </a>
                    ))}
                    {promotionReady.services.map((svc) => (
                      <a key={svc.slug} href={`/services/${svc.slug}`} target="_blank" rel="noreferrer" className="rounded-sm border border-gray-warm px-3 py-1.5 font-ui text-xs text-charcoal hover:border-navy hover:text-navy">
                        /services/{svc.slug} ↗
                      </a>
                    ))}
                  </div>
                  {areaRows.filter((r) => r.readinessStatus === "launch-ready").length === 0 && promotionReady.services.length === 0 ? (
                    <p className="mt-2 font-ui text-xs text-gray-mid">No pages are promotion-ready yet. Add photos and projects to improve readiness scores.</p>
                  ) : null}
                </div>

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Quick Links</p>
                  <div className="mt-2 flex flex-wrap gap-2 pt-1">
                    {[
                      { label: "sitemap.xml", href: "/sitemap.xml" },
                      { label: "robots.txt", href: "/robots.txt" },
                    ].map(({ label, href }) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-sm border border-gray-warm bg-white px-3 py-1.5 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                        {label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ── SOCIAL TAB ─────────────────────────────── */}
            {tab === "social" ? (
              <div className="space-y-6">
                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Connected Accounts</p>
                  <div className="mt-2 divide-y divide-gray-100">
                    <Check
                      ok={SOCIAL_ENABLED.instagram}
                      label={SOCIAL_ENABLED.instagram ? "Instagram connected" : "Instagram — credentials pending"}
                      fixLabel="Add env vars →"
                      fixHref="https://vercel.com/dashboard"
                    />
                    <Check
                      ok={SOCIAL_ENABLED.facebook}
                      label={SOCIAL_ENABLED.facebook ? "Facebook connected" : "Facebook — credentials pending"}
                      fixLabel="Add env vars →"
                      fixHref="https://vercel.com/dashboard"
                    />
                  </div>
                </div>

                {!SOCIAL_ENABLED.instagram && !SOCIAL_ENABLED.facebook ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="font-ui text-sm font-medium text-blue-800">Ready to activate</p>
                    <p className="mt-1 text-sm text-blue-700">
                      The full social queue and posting system is built and waiting. Add
                      FACEBOOK_APP_ID, FACEBOOK_PAGE_ACCESS_TOKEN, and INSTAGRAM_ACCOUNT_ID to
                      Vercel env vars when Tyler&#39;s business accounts are ready.
                    </p>
                    <p className="mt-2 font-ui text-xs text-blue-600">
                      Required: FACEBOOK_APP_ID · FACEBOOK_PAGE_ID · FACEBOOK_PAGE_ACCESS_TOKEN · INSTAGRAM_ACCOUNT_ID
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="font-ui text-xs uppercase tracking-[0.16em] text-gray-mid">Social Queue</p>
                  <p className="mt-2 text-sm text-gray-mid">
                    Schedule and track posts across Instagram and Facebook. Generate AI captions from project details.
                  </p>
                  <div className="mt-3">
                    <Link href="/admin/social" className="inline-flex items-center rounded-sm border border-gray-warm px-4 py-2 font-ui text-xs text-charcoal transition hover:border-navy hover:text-navy">
                      Open Social Queue →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
