import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import SitePhoto from "@/components/SitePhoto";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectRecordCard from "@/components/projects/ProjectRecordCard";
import ProjectSectionEmptyState from "@/components/projects/ProjectSectionEmptyState";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { findService, ACTIVE_SERVICES } from "@/content/services";
import { getProjectsByService } from "@/content/projects";
import { getServiceContentAuditRowBySlug } from "@/lib/contentAudit.server";
import { getServiceAssets } from "@/lib/portfolio.server";
import type { ServiceGalleryAsset } from "@/lib/portfolio.server";
import { buildQuoteHref } from "@/lib/publicLeadCtas";
import { listPublicProjects } from "@/lib/projectRecords.server";
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

function GalleryImage({
  asset,
  sizes,
}: {
  asset: ServiceGalleryAsset;
  sizes: string;
}) {
  return (
    <SitePhoto
      publicId={asset.source === "cloudinary" ? asset.publicId : undefined}
      imageUrl={asset.imageUrl}
      alt={asset.alt}
      sizes={sizes}
      mode="gallery"
    />
  );
}

function GalleryMeta({ asset }: { asset: ServiceGalleryAsset }) {
  if (!asset.title && !asset.location && !asset.serviceTags?.length && !asset.contextTags?.length) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {asset.title ? <p className="text-sm font-medium text-charcoal">{asset.title}</p> : null}
      {asset.location ? (
        <p className="mt-1 text-xs uppercase tracking-widest text-gray-mid">{asset.location}</p>
      ) : null}
      {asset.serviceTags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {asset.serviceTags.map((tag) => (
            <span
              key={`service-${tag.slug}`}
              className="rounded-full border border-red/20 bg-red/5 px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red"
            >
              {tag.title}
            </span>
          ))}
        </div>
      ) : null}
      {asset.contextTags?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {asset.contextTags.map((tag) => (
            <span
              key={`context-${tag.slug}`}
              className="rounded-full border border-gray-200 bg-cream px-2.5 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal"
            >
              {tag.title}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeroGallery({ asset }: { asset: ServiceGalleryAsset }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="relative h-[420px] w-full bg-cream p-2 sm:h-[520px]">
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
        <div className="relative bg-cream p-2" style={{ minHeight: "320px" }}>
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
            <div className="relative bg-cream p-2" style={{ minHeight: "148px" }}>
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
          <div className="relative bg-cream p-2" style={{ minHeight: "260px" }}>
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
          <div className="relative bg-cream p-2" style={{ height: "260px" }}>
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

export default async function ServiceDetailPage({ params }: Props) {
  const service = findService(params.service);
  if (!service) notFound();

  const quoteHref = buildQuoteHref({
    sourceType: "service-page",
    sourcePath: `/services/${service.slug}`,
    serviceSlug: service.slug,
    ctaLabel: service.ctaLabel,
  });

  const [linkedProjects, registryProjects, serviceAssets] = await Promise.all([
    listPublicProjects({ serviceSlug: service.slug, limit: 3 }),
    Promise.resolve(getProjectsByService(service.slug)),
    getServiceAssets(service.slug).catch(() => []),
  ]);

  const hasRegistryProjects = linkedProjects.length > 0 || registryProjects.length > 0;
  const hasServiceAssets = serviceAssets.length > 0;
  const hasContent = hasRegistryProjects || hasServiceAssets;

  const relatedServiceDefs = service.relatedServices
    .map((slug) => ACTIVE_SERVICES.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate));

  const fallbackProjects = relatedServiceDefs
    .flatMap((related) => getProjectsByService(related.slug))
    .filter((project, index, projects) =>
      projects.findIndex((candidate) => candidate.slug === project.slug) === index,
    )
    .slice(0, 3);

  const visibleProjectCards = linkedProjects.length
    ? linkedProjects
    : registryProjects.length > 0
      ? registryProjects.slice(0, 3)
      : fallbackProjects;

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <BreadcrumbTrail
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: service.shortTitle, href: `/services/${service.slug}` },
          ]}
        />
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Service</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{service.heroHeadline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-mid">{service.shortDescription}</p>
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
            View Recent Work
          </Link>
        </div>
      </section>

      <section id="service-proof" className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-ui text-xs uppercase tracking-widest text-red">Gallery</p>
            <h2 className="mt-2 text-3xl text-charcoal">Recent Work</h2>
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
            {visibleProjectCards.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjectCards.map((project) =>
                  "assets" in project ? (
                    <ProjectRecordCard
                      key={project.id}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ) : (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ),
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            {hasServiceAssets ? <ServiceGallery assets={serviceAssets} /> : null}
            {!hasServiceAssets && visibleProjectCards.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjectCards.map((project) =>
                  "assets" in project ? (
                    <ProjectRecordCard
                      key={project.id}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ) : (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      pageType="service"
                      sourceSlug={service.slug}
                    />
                  ),
                )}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl border border-gray-200 bg-cream p-6 md:p-8">
          <p className="font-ui text-xs uppercase tracking-widest text-red">Highlights</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {service.valueBullets.slice(0, 4).map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm text-charcoal">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {relatedServiceDefs.length > 0 ? (
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
      ) : null}

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
              <span key={item} className="font-ui text-xs text-white/70">
                {item}
              </span>
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
