import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import CloudinaryImage from "@/components/CloudinaryImage";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectSectionEmptyState from "@/components/projects/ProjectSectionEmptyState";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";
import { ACTIVE_AREAS } from "@/content/areas";
import { getReviewsByService } from "@/content/reviews";
import { findService, ACTIVE_SERVICES } from "@/content/services";
import { getProjectsByService } from "@/content/projects";
import { getTestimonialsByService } from "@/content/testimonials";
import { getServiceContentAuditRowBySlug } from "@/lib/contentAudit.server";
import { getServiceAssets } from "@/lib/portfolio.server";
import type { ServiceGalleryAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical } from "@/lib/seo";

const CTA_TRUST_ITEMS = ["Free quote", "Local install", "Built to fit", "Clear next steps"] as const;

type Props = {
  params: {
    service: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = findService(params.service);
  if (!service) {
    return {
      title: "Service Not Found | Sublime Design NV",
      description: "Service page not found.",
    };
  }
  const readiness = await getServiceContentAuditRowBySlug(service.slug);
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: {
      canonical: buildFacetCanonical(`/services/${service.slug}`),
    },
    robots: readiness?.shouldNoindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: buildFacetCanonical(`/services/${service.slug}`),
    },
  };
}

// ─── Gallery sub-components ──────────────────────────────────────────────────

function GalleryImage({
  asset,
  sizes,
}: {
  asset: ServiceGalleryAsset;
  sizes: string;
}) {
  if (asset.source === "cloudinary" && asset.publicId) {
    return (
      <CloudinaryImage
        src={asset.publicId}
        alt={asset.alt}
        width={1200}
        height={800}
        sizes={sizes}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Image
      src={asset.secureUrl}
      alt={asset.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

function GalleryMeta({ asset }: { asset: ServiceGalleryAsset }) {
  if (!asset.title && !asset.location) return null;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {asset.title ? <p className="text-sm font-medium text-charcoal">{asset.title}</p> : null}
      {asset.location ? (
        <p className="mt-1 text-xs uppercase tracking-widest text-gray-mid">{asset.location}</p>
      ) : null}
    </div>
  );
}

function HeroGallery({ asset }: { asset: ServiceGalleryAsset }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="relative h-[420px] w-full sm:h-[520px]">
        <GalleryImage asset={asset} sizes="100vw" />
      </div>
      <GalleryMeta asset={asset} />
    </div>
  );
}

function MasonryGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  const [first, ...rest] = assets;
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div
          className="relative"
          style={{ minHeight: "320px" }}
        >
          <GalleryImage asset={first} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <GalleryMeta asset={first} />
      </div>
      <div className="flex flex-col gap-4">
        {rest.map((asset) => (
          <div
            key={asset.secureUrl}
            className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          >
            <div
              className="relative"
              style={{ minHeight: "148px" }}
            >
              <GalleryImage asset={asset} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <GalleryMeta asset={asset} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TwoUpGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {assets.map((asset) => (
        <div
          key={asset.secureUrl}
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        >
          <div
            className="relative"
            style={{ minHeight: "260px" }}
          >
            <GalleryImage asset={asset} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <GalleryMeta asset={asset} />
        </div>
      ))}
    </div>
  );
}

function FullGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <div
          key={asset.secureUrl}
          className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        >
          <div
            className="relative"
            style={{ height: "260px" }}
          >
            <GalleryImage
              asset={asset}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <GalleryMeta asset={asset} />
        </div>
      ))}
    </div>
  );
}

function ServiceGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  if (assets.length === 1) return <HeroGallery asset={assets[0]} />;
  if (assets.length === 2) return <TwoUpGallery assets={assets} />;
  if (assets.length <= 4) return <MasonryGallery assets={assets} />;
  return <FullGallery assets={assets} />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ServiceDetailPage({ params }: Props) {
  const service = findService(params.service);
  if (!service) notFound();
  const quoteHref = `/quote?service=${service.slug}`;

  const [registryProjects, serviceAssets] = await Promise.all([
    Promise.resolve(getProjectsByService(service.slug)),
    getServiceAssets(service.slug).catch(() => []),
  ]);

  const serviceTestimonials = getTestimonialsByService(service.slug).slice(0, 3);
  const serviceReviews = getReviewsByService(service.slug).slice(0, 2);

  const hasRegistryProjects = registryProjects.length > 0;
  const hasServiceAssets = serviceAssets.length > 0;
  const hasContent = hasRegistryProjects || hasServiceAssets;
  const proofProject = registryProjects[0];

  const relatedServiceDefs = service.relatedServices
    .map((slug) => ACTIVE_SERVICES.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const fallbackProjects = relatedServiceDefs
    .flatMap((related) => getProjectsByService(related.slug))
    .filter((project, index, projects) =>
      projects.findIndex((candidate) => candidate.slug === project.slug) === index,
    )
    .slice(0, 3);
  const primaryArea = ACTIVE_AREAS.find((area) =>
    area.relatedServiceSlugs.includes(service.slug),
  );
  const hasProofGap = !hasServiceAssets || !hasRegistryProjects;
  const galleryHeading = hasServiceAssets ? "Project Gallery" : "Related Proof";

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <BreadcrumbTrail
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.shortTitle, href: `/services/${service.slug}` },
          ]}
        />
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">
          {service.status === "coming-soon" ? "Coming Soon" : "Service"}
        </p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{service.heroHeadline}</h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-mid">{service.heroBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedLink
            href={quoteHref}
            eventName="proof_cta_click"
            eventParams={{
              page_type: "service",
              service_slug: service.slug,
              cta_location: "service_hero_quote_cta",
            }}
            className="font-ui rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {service.ctaLabel}
          </TrackedLink>
          <Link
            href="#service-proof"
            className="font-ui rounded-sm border border-gray-300 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
          >
            View Proof
          </Link>
        </div>
      </section>

      {/* ── 2. Intro paragraph ──────────────────────────────────────────── */}
      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <p className="max-w-3xl text-base leading-7 text-charcoal/80">{service.introParagraph}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-mid">
          Looking for {service.shortTitle.toLowerCase()} in Las Vegas, Henderson, or Summerlin?
          Review recent{" "}
          <Link href="/projects" className="font-semibold text-red hover:underline">
            project work
          </Link>
          {" "}and then{" "}
          <Link href="/quote" className="font-semibold text-red hover:underline">
            start with a quote
          </Link>
          {" "}when the scope is clear.
        </p>
      </section>

      {/* ── 3. Value bullets ────────────────────────────────────────────── */}
      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <ul className="space-y-3">
          {service.valueBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-charcoal">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
              {bullet}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 4. Gallery / Project cards ──────────────────────────────────── */}
      <section id="service-proof" className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-xs uppercase tracking-widest text-red">
              {hasProofGap ? "Proof" : "Gallery"}
            </p>
            <h2 className="mt-2 text-3xl text-charcoal">{galleryHeading}</h2>
          </div>
          <Link href="/projects" className="font-ui text-sm font-semibold text-red">
            View All Projects →
          </Link>
        </div>

        {!hasContent ? (
          <div className="mt-6">
            <ProjectSectionEmptyState
              copy={`${service.shortTitle} photos are still being added, but the category is active and quote-ready. Send the opening, wall, or room details and we will guide the right scope, finish path, and install approach.`}
              ctaHref={quoteHref}
              ctaLabel={service.ctaLabel}
            />
            {fallbackProjects.length > 0 ? (
              <div className="mt-8">
                <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Related Project Examples
                </p>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {fallbackProjects.map((project) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            {hasServiceAssets ? (
              <ServiceGallery assets={serviceAssets} />
            ) : null}
            {hasServiceAssets ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-mid">
                Real project photos tagged to {service.shortTitle.toLowerCase()} will surface here first. If the gallery is still growing, the related project cards below show adjacent proof while the category fills in.
              </p>
            ) : null}
            {hasRegistryProjects ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {registryProjects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    pageType="service"
                    sourceSlug={service.slug}
                  />
                ))}
              </div>
            ) : fallbackProjects.length > 0 ? (
              <div className="mt-8">
                <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">
                  Related Project Examples
                </p>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {fallbackProjects.map((project) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-mid">
                Projects coming soon. Start with a quote and we can share examples that fit the space.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── 5. Process ──────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <h2 className="text-3xl text-charcoal">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {service.processSteps.map((step, index) => (
            <div key={step} className="rounded-xl border border-gray-200 bg-cream p-6">
              <p className="font-ui text-xs uppercase tracking-[0.2em] text-red">
                Step {index + 1}
              </p>
              <p className="mt-3 text-base text-charcoal">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-3xl px-4 md:px-8">
        <h2 className="text-3xl text-charcoal">Common Questions</h2>
        <div className="mt-8 divide-y divide-gray-200">
          {service.faq.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="text-base font-medium text-charcoal">{item.question}</span>
                <span className="mt-0.5 flex-shrink-0 text-red transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-gray-mid">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── 7. Client testimonials ──────────────────────────────────────── */}
      {serviceTestimonials.length > 0 && (
        <section className="bg-cream py-16 mt-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="text-2xl text-charcoal">What Clients Say</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {serviceTestimonials.map((t) => (
                <figure
                  key={t.slug}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <blockquote className="flex-1">
                    <p className="text-base leading-7 text-charcoal/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </blockquote>
                  <figcaption className="mt-5 border-t border-gray-100 pt-4">
                    <p className="font-ui text-sm font-semibold text-charcoal">{t.name}</p>
                    <p className="font-ui text-xs text-gray-mid">{t.location}</p>
                    {t.roleOrContext ? (
                      <p className="font-ui mt-0.5 text-xs text-gray-mid">{t.roleOrContext}</p>
                    ) : null}
                    {t.projectSlug ? (
                      <Link
                        href={`/projects/${t.projectSlug}`}
                        className="font-ui mt-2 inline-block text-xs font-medium text-red hover:underline"
                      >
                        View Project
                      </Link>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {serviceReviews.length ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <ReviewSourcePlaceholder
            reviews={serviceReviews}
            compact
            eyebrow="Client Reviews"
            title={`${service.shortTitle} Reviews`}
            subheading={`Recent homeowner feedback on ${service.shortTitle.toLowerCase()} projects completed across Las Vegas, Henderson, and Summerlin.`}
            emptyBehavior="hide"
            pageType="service"
            showCompactCta={Boolean(proofProject)}
            ctaHref={proofProject ? `/projects/${proofProject.slug}` : "/projects"}
            ctaLabel={proofProject ? `View ${service.shortTitle} Project` : "View Projects"}
            eventContext="service_proof_cta"
          />
          {primaryArea ? (
            <p className="mt-4 text-sm text-gray-mid">
              Need local examples? See recent {service.shortTitle.toLowerCase()} work in{" "}
              <TrackedLink
                href={`/areas/${primaryArea.slug}`}
                eventName="proof_cta_click"
                eventParams={{
                  page_type: "service",
                  service_slug: service.slug,
                  destination_type: "area",
                  destination_slug: primaryArea.slug,
                  cta_location: "service_primary_area_link",
                }}
                className="font-semibold text-red hover:underline"
              >
                {primaryArea.name}
              </TrackedLink>
              .
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ── 8. Related services ─────────────────────────────────────────── */}
      {relatedServiceDefs.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
          <h2 className="text-2xl text-charcoal">Related Services</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {relatedServiceDefs.map((related) => (
              <Link
                key={related.slug}
                href={`/services/${related.slug}`}
                className="rounded-lg border border-gray-200 bg-cream px-5 py-3 text-sm font-medium text-charcoal transition hover:border-red hover:text-red"
              >
                {related.shortTitle}
              </Link>
            ))}
            <Link
              href="/services"
              className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-mid transition hover:border-red hover:text-red"
            >
              All Services →
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl border border-gray-200 bg-cream p-6">
          <p className="font-ui text-xs uppercase tracking-widest text-red">Areas We Serve</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-mid">
            We install {service.shortTitle.toLowerCase()} across the Las Vegas Valley, including{" "}
            {ACTIVE_AREAS.map((area, index) => (
              <span key={area.slug}>
                {index > 0 ? ", " : ""}
                <TrackedLink
                  href={`/areas/${area.slug}`}
                  eventName="proof_cta_click"
                  eventParams={{
                    page_type: "service",
                    service_slug: service.slug,
                    destination_type: "area",
                    destination_slug: area.slug,
                    cta_location: "service_areas_block",
                  }}
                  className="font-semibold text-red hover:underline"
                >
                  {area.name}
                </TrackedLink>
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      {/* ── 9. Quote CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">{service.ctaLabel}</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Send your details and we will reply with next steps, timeline, and quote options.
          </p>
          <TrackedLink
            href={quoteHref}
            eventName="proof_cta_click"
            eventParams={{
              page_type: "service",
              service_slug: service.slug,
              cta_location: "service_quote_cta",
            }}
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            {service.ctaLabel}
          </TrackedLink>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
            {CTA_TRUST_ITEMS.map((item) => (
              <span key={item} className="font-ui text-xs text-white/70">{item}</span>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-sm text-white/85">
            We answer with next steps, scheduling guidance, and whether a site measure is the right
            move for the job.
          </p>
        </div>
      </section>
    </main>
  );
}
