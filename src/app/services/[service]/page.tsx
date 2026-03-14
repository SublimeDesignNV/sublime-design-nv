import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import { findService } from "@/content/services";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { getServiceAssets } from "@/lib/portfolio.server";
import type { ServiceGalleryAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical, buildProjectImageAlt } from "@/lib/seo";

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

  return {
    title: `${service.title} | Sublime Design NV`,
    description: service.description,
    alternates: {
      canonical: buildFacetCanonical(`/services/${service.slug}`),
    },
  };
}

/** Render a single gallery asset using the right image component for its source. */
function GalleryImage({
  asset,
  sizes,
  className,
}: {
  asset: ServiceGalleryAsset;
  sizes: string;
  className?: string;
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
  // Seed image
  return (
    <Image
      src={asset.secureUrl}
      alt={asset.alt}
      fill
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

/** 1-image: full-width hero layout */
function HeroGallery({ asset }: { asset: ServiceGalleryAsset }) {
  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-[420px] w-full sm:h-[520px]">
        <GalleryImage asset={asset} sizes="100vw" />
      </div>
    </div>
  );
}

/** 2–4 images: featured-first masonry grid */
function MasonryGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  const [first, ...rest] = assets;
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* First image spans full height on the left */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" style={{ minHeight: "320px" }}>
        <GalleryImage asset={first} sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      {/* Remaining images stacked on the right */}
      <div className="flex flex-col gap-4">
        {rest.map((asset) => (
          <div
            key={asset.secureUrl}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            style={{ minHeight: "148px" }}
          >
            <GalleryImage asset={asset} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 5+ images: standard 3-column grid */
function FullGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <div
          key={asset.secureUrl}
          className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          style={{ height: "260px" }}
        >
          <GalleryImage asset={asset} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      ))}
    </div>
  );
}

function ServiceGallery({ assets }: { assets: ServiceGalleryAsset[] }) {
  if (assets.length === 1) return <HeroGallery asset={assets[0]} />;
  if (assets.length <= 4) return <MasonryGallery assets={assets} />;
  return <FullGallery assets={assets} />;
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = findService(params.service);
  if (!service) notFound();

  // All slugs to match (canonical + aliases)
  const matchSlugs = [service.slug, ...service.aliases];

  // Cloudinary project cards (existing behavior)
  const allProjects = await listProjectsIndex(500).catch(() => []);
  const projects = allProjects.filter(
    (p) => p.serviceSlug && matchSlugs.includes(p.serviceSlug),
  );

  // Service assets — Cloudinary first, seed fallback built-in via getServiceAssets
  const serviceAssets = await getServiceAssets(service.slug).catch(() => []);

  const hasProjects = projects.length > 0;
  const hasServiceAssets = serviceAssets.length > 0;
  const hasContent = hasProjects || hasServiceAssets;

  return (
    <main className="bg-white pb-20 pt-24">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">
          {service.status === "coming-soon" ? "Coming Soon" : "Service"}
        </p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{service.heroHeadline}</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">{service.heroBody}</p>

        {/* Value bullets */}
        <ul className="mt-6 space-y-2">
          {service.valueBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3 text-sm text-charcoal">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
              {bullet}
            </li>
          ))}
        </ul>
      </section>

      {/* Gallery */}
      <section className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-charcoal">Project Gallery</h2>
          <Link href="/gallery" className="font-ui text-sm font-semibold text-red">
            View Full Gallery →
          </Link>
        </div>

        {!hasContent ? (
          /* 0 images — polished empty state */
          <div className="mt-6 rounded-xl border border-gray-200 bg-cream p-8">
            <p className="text-gray-mid">
              We are adding more {service.shortTitle.toLowerCase()} projects now. In the meantime,
              get in touch and we can share examples directly.
            </p>
            <Link
              href="/quote"
              className="font-ui mt-4 inline-block rounded-sm bg-red px-5 py-2.5 text-sm font-semibold text-white"
            >
              Request a Quote
            </Link>
          </div>
        ) : hasProjects ? (
          /* Cloudinary project cards */
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.slug}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {project.heroPublicId ? (
                  <Link href={`/projects/${project.slug}`} className="block">
                    <CloudinaryImage
                      src={project.heroPublicId}
                      alt={
                        project.heroAlt ||
                        buildProjectImageAlt({
                          service: project.serviceSlug,
                          city: project.cityLabel,
                          state: project.state,
                          room: project.roomLabel,
                          material: project.materialLabel,
                        })
                      }
                      width={1200}
                      height={800}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    />
                  </Link>
                ) : null}
                <div className="p-4">
                  <h3 className="text-xl text-charcoal">
                    <Link href={`/projects/${project.slug}`} className="hover:text-red">
                      {project.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-gray-mid">
                    {[project.cityLabel, project.state, project.materialLabel]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Tiered service asset gallery — Cloudinary or seed */
          <ServiceGallery assets={serviceAssets} />
        )}
      </section>

      {/* Back link */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <Link href="/services" className="font-ui text-sm font-semibold text-red">
          ← All Services
        </Link>
      </section>

      {/* Quote CTA */}
      <section className="mx-auto mt-10 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">{service.ctaLabel}</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Send your details and we will reply with next steps, timeline, and quote options.
          </p>
          <Link
            href="/quote"
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
