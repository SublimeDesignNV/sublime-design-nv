import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import { isAdminAuthConfigured, requireAdmin } from "@/lib/auth";
import { FEATURED_PROJECTS, FLAGSHIP_PROJECTS } from "@/content/projects";
import { FEATURED_TESTIMONIALS } from "@/content/testimonials";
import {
  getAreaContentAuditRows,
  getFlagshipProjectAuditRows,
  getLaunchReadinessSummary,
  getProjectContentAuditRows,
  getPromotionReadyPanel,
  getPromotionReadySummary,
  getServiceContentAuditRows,
} from "@/lib/contentAudit.server";

export const dynamic = "force-dynamic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Check({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {ok ? "✓" : "✗"}
      </span>
      <div>
        <p className="text-sm font-medium text-charcoal">{label}</p>
        {detail ? <p className="text-xs text-gray-mid">{detail}</p> : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-cream px-5 py-3">
        <p className="font-ui text-xs font-semibold uppercase tracking-widest text-gray-mid">
          {title}
        </p>
      </div>
      <div className="divide-y divide-gray-100 px-5">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <p className="text-sm text-charcoal">{label}</p>
      <p className="font-ui text-sm font-semibold text-charcoal">{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LaunchAuditPage() {
  await requireAdmin("/admin/launch-audit");

  // ── Env checks ────────────────────────────────────────────────────────────
  const hasGa = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasCloudinaryCloud = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const hasCloudinaryPreset = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const hasCloudinaryApiCloud = Boolean(process.env.CLOUDINARY_CLOUD_NAME);
  const hasCloudinaryApiKey = Boolean(process.env.CLOUDINARY_API_KEY);
  const hasCloudinaryApiSecret = Boolean(process.env.CLOUDINARY_API_SECRET);
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasAdminLogin = isAdminAuthConfigured();
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET);
  const hasGoogleClientId = Boolean(process.env.AUTH_GOOGLE_ID);
  const hasGoogleClientSecret = Boolean(process.env.AUTH_GOOGLE_SECRET);
  const hasAdminAllowedEmails = Boolean(process.env.ADMIN_ALLOWED_EMAILS);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  const hasFromEmail = Boolean(process.env.LEADS_FROM_EMAIL);
  const summary = await getLaunchReadinessSummary();
  const flagshipRows = await getFlagshipProjectAuditRows();
  const areaRows = await getAreaContentAuditRows();
  const projectRows = await getProjectContentAuditRows();
  const serviceRows = await getServiceContentAuditRows();
  const promotionReady = await getPromotionReadySummary();
  const promotionPanel = await getPromotionReadyPanel();
  const hasCloudinaryConfigured =
    hasCloudinaryCloud &&
    hasCloudinaryPreset &&
    hasCloudinaryApiCloud &&
    hasCloudinaryApiKey &&
    hasCloudinaryApiSecret;

  // ── Content counts ────────────────────────────────────────────────────────
  const activeServices = summary.activeServices;
  const activeAreas = summary.activeAreas;
  const totalProjects = summary.totalProjects;
  const featuredProjects = FEATURED_PROJECTS.length;
  const flagshipProjects = FLAGSHIP_PROJECTS.length;
  const featuredTestimonials = FEATURED_TESTIMONIALS.length;

  return (
    <main className="bg-cream pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-sm uppercase tracking-widest text-red">Admin</p>
            <h1 className="mt-1 text-3xl text-charcoal">Launch Audit</h1>
          </div>
          <Link href="/admin" className="font-ui text-sm text-gray-mid hover:text-charcoal">
            ← Admin home
          </Link>
        </div>
        <AdminNav />

        <div className="mt-8 space-y-6">
          {/* Environment / integrations */}
          <Section title="Integrations">
            <Check
              ok={hasGa}
              label="Google Analytics (GA4)"
              detail={
                hasGa
                  ? `ID: ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
                  : "Set NEXT_PUBLIC_GA_MEASUREMENT_ID to enable"
              }
            />
            <Check
              ok={hasResend}
              label="Resend email"
              detail={hasResend ? "RESEND_API_KEY configured" : "Set RESEND_API_KEY to enable quote emails"}
            />
            <Check
              ok={hasCloudinaryConfigured}
              label="Cloudinary photo upload"
              detail={
                hasCloudinaryConfigured
                  ? `Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`
                  : "Set public upload vars and server Cloudinary API vars"
              }
            />
            <Check
              ok={hasDb}
              label="Database (lead persistence)"
              detail={hasDb ? "DATABASE_URL configured" : "Set DATABASE_URL + run prisma migrate deploy"}
            />
          </Section>

          {/* Site config */}
          <Section title="Site Config">
            <Check
              ok={hasSiteUrl}
              label="NEXT_PUBLIC_SITE_URL"
              detail={
                hasSiteUrl
                  ? process.env.NEXT_PUBLIC_SITE_URL
                  : "Falling back to https://sublimedesignnv.com"
              }
            />
            <Check
              ok={hasAdminLogin}
              label="Admin login configured"
              detail={
                hasAdminLogin
                  ? "Google OAuth + allowed admin emails configured"
                  : "Set AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, and ADMIN_ALLOWED_EMAILS"
              }
            />
            <Check
              ok={hasAuthSecret && hasGoogleClientId && hasGoogleClientSecret && hasAdminAllowedEmails}
              label="OAuth credentials"
              detail={
                hasAuthSecret && hasGoogleClientId && hasGoogleClientSecret && hasAdminAllowedEmails
                  ? "AUTH_SECRET, Google OAuth credentials, and ADMIN_ALLOWED_EMAILS configured"
                  : "Missing one or more Google admin auth variables"
              }
            />
            <Check
              ok={hasFromEmail}
              label="LEADS_FROM_EMAIL"
              detail={
                hasFromEmail
                  ? process.env.LEADS_FROM_EMAIL
                  : "Falling back to Sublime Design NV <admin@sublimedesignnv.com>"
              }
            />
            <Check
              ok
              label="Admin route access"
              detail="Protected admin pages redirect to /admin/login and require an authorized Google session."
            />
          </Section>

          {/* Content counts */}
          <Section title="Content Registry">
            <Stat label="Active services" value={activeServices} />
            <Stat label="Active areas" value={activeAreas} />
            <Stat label="Project case studies" value={totalProjects} />
            <Stat label="Flagship projects" value={flagshipProjects} />
            <Stat label="Featured projects" value={featuredProjects} />
            <Stat label="Hero-ready services" value={summary.servicesWithHeroCandidate} />
            <Stat label="Promotion-ready services" value={summary.promotionReadyServices} />
            <Stat label="Promotion-ready projects" value={summary.promotionReadyProjects} />
            <Stat label="Promotion-ready areas" value={summary.promotionReadyAreas} />
            <Stat label="Featured testimonials" value={featuredTestimonials} />
          </Section>

          <Section title="Launch Checklist">
            <Check ok={hasGa} label="GA configured" />
            <Check ok={hasResend} label="Resend configured" />
            <Check ok={hasCloudinaryConfigured} label="Cloudinary configured" />
            <Check ok={hasDb} label="Database configured" />
            <Check ok={hasAdminLogin} label="Admin login configured" />
            <Check ok={hasSiteUrl} label="Site URL configured" />
          </Section>

          <Section title="Content Readiness">
            <Check
              ok={summary.thresholds.hasSixActiveServices}
              label="At least 6 active services"
              detail={`${summary.activeServices} active services`}
            />
            <Check
              ok={summary.thresholds.hasSixProjects}
              label="At least 6 projects"
              detail={`${summary.totalProjects} registered projects`}
            />
            <Check
              ok={summary.thresholds.hasThreeFlagshipOrFeaturedProjects}
              label="At least 3 flagship or featured projects"
              detail={`${summary.flagshipOrFeaturedProjects} priority projects`}
            />
            <Check
              ok={summary.thresholds.hasOneHeroCandidate}
              label="At least 1 hero candidate"
              detail={`${summary.servicesWithHeroCandidate} hero-ready services`}
            />
          </Section>

          <Section title="Flagship Content Readiness">
            {flagshipRows.map((row) => (
              <div key={row.slug} className="py-3">
                <p className="text-sm font-medium text-charcoal">{row.title}</p>
                <p className="mt-1 text-xs text-gray-mid">{row.location}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-mid sm:grid-cols-3">
                  <span>Images: {row.imageCount}/{row.targetImageCount}</span>
                  <span>Gallery: {row.galleryStatus}</span>
                  <span>Fallback: {row.usingSeedFallback ? "seed" : "cloudinary"}</span>
                  <span>Hero: {row.hasHeroImage ? "yes" : "no"}</span>
                  <span>Hero source: {row.heroFromCloudinary ? "cloud" : "seed"}</span>
                  <span>Linked review: {row.hasLinkedReview ? "yes" : "no"}</span>
                  <span>Proof: {row.hasReviewOrTestimonial ? "yes" : "no"}</span>
                  <span>CTA line: {row.hasStrongCtaLine ? "yes" : "no"}</span>
                  <span>Summary: {row.hasProjectSummary ? "yes" : "no"}</span>
                  <span>Before/after: {row.hasBeforeAfterContent ? "yes" : "no"}</span>
                  <span>Real-world: {row.hasRealWorldContent ? "yes" : "no"}</span>
                  <span>Rich content: {row.hasRichContent ? "yes" : "no"}</span>
                  <span>OG ready: {row.hasOgReadyMetadata ? "yes" : "no"}</span>
                  <span>Share ready: {row.hasShareReadyMetadataInputs ? "yes" : "no"}</span>
                  <span>Location: {row.hasLocation ? "yes" : "no"}</span>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Promotion Ready">
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Flagship projects ready to promote</p>
              <p className="mt-1 text-xs text-gray-mid">
                {promotionReady.projects.length
                  ? promotionReady.projects.map((row) => row.title).join(" · ")
                  : "No flagship projects are fully promotion-ready yet."}
              </p>
            </div>
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Services ready to promote</p>
              <p className="mt-1 text-xs text-gray-mid">
                {promotionReady.services.length
                  ? promotionReady.services.map((row) => row.title).join(" · ")
                  : "No service pages are fully promotion-ready yet."}
              </p>
            </div>
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Areas ready to promote</p>
              <p className="mt-1 text-xs text-gray-mid">
                {promotionReady.areas.length
                  ? promotionReady.areas.map((row) => row.name).join(" · ")
                  : "No area pages are fully promotion-ready yet."}
              </p>
            </div>
          </Section>

          <Section title="Promote Now">
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Flagship project pages</p>
              <div className="mt-3 space-y-3 text-xs text-gray-mid">
                {promotionPanel.flagshipProjects.length ? promotionPanel.flagshipProjects.map((item) => (
                  <div key={item.href}>
                    <p className="text-sm font-medium text-charcoal">{item.title}</p>
                    <p>Status: {item.readinessStatus}</p>
                    <p>{item.whyReady}</p>
                    <p>{item.note}</p>
                    <p className="font-mono">{item.href}</p>
                  </div>
                )) : <p>No flagship project pages are ready to push yet.</p>}
              </div>
            </div>
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Services</p>
              <div className="mt-3 space-y-3 text-xs text-gray-mid">
                {promotionPanel.services.length ? promotionPanel.services.map((item) => (
                  <div key={item.href}>
                    <p className="text-sm font-medium text-charcoal">{item.title}</p>
                    <p>Status: {item.readinessStatus}</p>
                    <p>{item.whyReady}</p>
                    <p>{item.note}</p>
                    <p className="font-mono">{item.href}</p>
                  </div>
                )) : <p>No service pages are ready to push yet.</p>}
              </div>
            </div>
            <div className="py-3">
              <p className="text-sm font-medium text-charcoal">Area pages</p>
              <div className="mt-3 space-y-3 text-xs text-gray-mid">
                {promotionPanel.areas.length ? promotionPanel.areas.map((item) => (
                  <div key={item.href}>
                    <p className="text-sm font-medium text-charcoal">{item.title}</p>
                    <p>Status: {item.readinessStatus}</p>
                    <p>{item.whyReady}</p>
                    <p>{item.note}</p>
                    <p className="font-mono">{item.href}</p>
                  </div>
                )) : <p>No area pages are ready to push yet.</p>}
              </div>
            </div>
          </Section>

          <Section title="Noindex Guardrails">
            <Check
              ok
              label="Thin pages are being identified for noindex guardrails"
              detail={`${serviceRows.filter((row) => row.shouldNoindex).length} service pages, ${projectRows.filter((row) => row.shouldNoindex).length} project pages, and ${areaRows.filter((row) => row.shouldNoindex).length} area pages currently qualify for noindex until proof density improves.`}
            />
          </Section>

          {/* Quick links */}
          <Section title="Quick Links">
            <div className="flex flex-wrap gap-3 py-3">
              <Link
                href="/admin/leads"
                className="font-ui rounded-sm bg-red px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Lead Inbox
              </Link>
              <Link
                href="/admin/content-audit"
                className="font-ui rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal hover:bg-gray-50"
              >
                Content Audit
              </Link>
              <Link
                href="/sitemap.xml"
                target="_blank"
                className="font-ui rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal hover:bg-gray-50"
              >
                sitemap.xml ↗
              </Link>
              <Link
                href="/robots.txt"
                target="_blank"
                className="font-ui rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal hover:bg-gray-50"
              >
                robots.txt ↗
              </Link>
              <Link
                href="/quote"
                target="_blank"
                className="font-ui rounded-sm border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal hover:bg-gray-50"
              >
                Quote form ↗
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
