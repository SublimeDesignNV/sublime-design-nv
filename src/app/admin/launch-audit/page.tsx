import Link from "next/link";
import { isAdminSession } from "@/lib/adminAuth";
import { ACTIVE_SERVICES } from "@/content/services";
import { PROJECT_LIST, FEATURED_PROJECTS } from "@/content/projects";
import { FEATURED_TESTIMONIALS } from "@/content/testimonials";

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

export default function LaunchAuditPage() {
  if (!isAdminSession()) {
    return (
      <main className="bg-cream pt-28 pb-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <p className="text-gray-mid">Admin access required.</p>
          <Link href="/admin" className="mt-4 inline-block font-ui text-sm font-semibold text-red">
            Sign in →
          </Link>
        </div>
      </main>
    );
  }

  // ── Env checks ────────────────────────────────────────────────────────────
  const hasGa = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasCloudinaryCloud = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const hasCloudinaryPreset = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasAdminToken = Boolean(process.env.ADMIN_TOKEN);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  const hasFromEmail = Boolean(process.env.LEADS_FROM_EMAIL);

  // ── Content counts ────────────────────────────────────────────────────────
  const activeServices = ACTIVE_SERVICES.length;
  const totalProjects = PROJECT_LIST.length;
  const featuredProjects = FEATURED_PROJECTS.length;
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
              ok={hasCloudinaryCloud && hasCloudinaryPreset}
              label="Cloudinary photo upload"
              detail={
                hasCloudinaryCloud && hasCloudinaryPreset
                  ? `Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`
                  : "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET"
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
              ok={hasAdminToken}
              label="ADMIN_TOKEN"
              detail={hasAdminToken ? "Set" : "Set ADMIN_TOKEN to protect admin routes"}
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
          </Section>

          {/* Content counts */}
          <Section title="Content Registry">
            <Stat label="Active services" value={activeServices} />
            <Stat label="Project case studies" value={totalProjects} />
            <Stat label="Featured projects" value={featuredProjects} />
            <Stat label="Featured testimonials" value={featuredTestimonials} />
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
