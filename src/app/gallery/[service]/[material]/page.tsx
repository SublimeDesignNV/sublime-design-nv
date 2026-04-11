import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import { findService, ACTIVE_SERVICES } from "@/content/services";
import { db } from "@/lib/db";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: { service: string; material: string };
};

function materialLabelFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = findService(params.service);
  if (!service) return { title: "Not Found | Sublime Design NV" };

  const materialLabel = materialLabelFromSlug(params.material);
  const siteUrl = getSiteUrl();
  const canonicalPath = `/gallery/${params.service}/${params.material}`;

  return {
    title: `${materialLabel} ${service.shortTitle} Las Vegas | Sublime Design NV`,
    description: `See real ${materialLabel} ${service.shortTitle.toLowerCase()} projects installed in Las Vegas, NV. Photos, specs, and free quotes from Sublime Design NV.`,
    alternates: { canonical: buildFacetCanonical(canonicalPath) },
    openGraph: {
      title: `${materialLabel} ${service.shortTitle} Las Vegas | Sublime Design NV`,
      url: `${siteUrl}${canonicalPath}`,
    },
    keywords: [
      `${materialLabel} ${service.shortTitle} Las Vegas`,
      `${materialLabel} ${service.shortTitle.toLowerCase()} contractor`,
      `custom ${materialLabel.toLowerCase()} ${service.shortTitle.toLowerCase()}`,
      `${materialLabel.toLowerCase()} ${service.shortTitle.toLowerCase()} NV`,
    ].join(", "),
  };
}

export default async function MaterialServicePage({ params }: Props) {
  const service = findService(params.service);
  if (!service) notFound();

  const materialLabel = materialLabelFromSlug(params.material);
  const siteUrl = getSiteUrl();

  // Match material slug back to string variants that may appear in the materials array
  const materialSearch = params.material.replace(/-/g, " ");

  const assets = await db.asset.findMany({
    where: {
      published: true,
      kind: "IMAGE",
      primaryServiceSlug: params.service,
      materials: { has: materialSearch },
    },
    select: { id: true, secureUrl: true, alt: true, location: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  // Also try case-insensitive variant if exact match returns nothing
  const displayAssets =
    assets.length > 0
      ? assets
      : await db.asset.findMany({
          where: {
            published: true,
            kind: "IMAGE",
            primaryServiceSlug: params.service,
            materials: {
              hasSome: [materialSearch, materialLabel, params.material],
            },
          },
          select: { id: true, secureUrl: true, alt: true, location: true },
          orderBy: { createdAt: "desc" },
          take: 24,
        });

  const otherServices = ACTIVE_SERVICES.filter((s) => s.slug !== params.service);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${materialLabel} ${service.shortTitle} Las Vegas`,
    description: `Photos of ${materialLabel} ${service.shortTitle.toLowerCase()} projects in Las Vegas, NV.`,
    url: `${siteUrl}/gallery/${params.service}/${params.material}`,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "Sublime Design NV",
      url: siteUrl,
    },
    ...(displayAssets[0]?.secureUrl ? { image: displayAssets[0].secureUrl } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <LocalBusinessSchema />

      <main className="bg-white pb-24 pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <BreadcrumbTrail
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Gallery", href: "/gallery" },
              { label: service.shortTitle, href: `/gallery` },
              {
                label: `${materialLabel} ${service.shortTitle}`,
                href: `/gallery/${params.service}/${params.material}`,
              },
            ]}
          />

          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            Material Gallery
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">
            {materialLabel} {service.shortTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-mid">
            Real {materialLabel.toLowerCase()} {service.shortTitle.toLowerCase()} projects built
            and installed in Las Vegas, NV. Every photo is from an actual completed job.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/quote?service=${params.service}&material=${params.material}`}
              className="font-ui inline-flex rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Quote My {materialLabel} Project
            </Link>
            <Link
              href={`/services/${params.service}`}
              className="font-ui inline-flex rounded-sm border border-gray-200 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
            >
              About {service.shortTitle}
            </Link>
          </div>

          {displayAssets.length > 0 ? (
            <div className="mt-10 columns-2 gap-3 space-y-3 md:columns-3">
              {displayAssets.map((asset) => (
                <div key={asset.id} className="break-inside-avoid overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.secureUrl}
                    alt={
                      asset.alt ??
                      `${materialLabel} ${service.shortTitle}${asset.location ? ` in ${asset.location}` : ""}`
                    }
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-gray-200 bg-cream px-8 py-16 text-center">
              <p className="font-ui text-base text-gray-mid">
                No {materialLabel} {service.shortTitle.toLowerCase()} photos yet — check back as
                more projects are uploaded.
              </p>
              <Link
                href={`/quote?service=${params.service}`}
                className="font-ui mt-4 inline-block text-sm font-semibold text-red hover:underline"
              >
                Start your project →
              </Link>
            </div>
          )}

          <section className="mt-16">
            <h2 className="text-xl font-semibold text-charcoal">
              More {service.shortTitle} Galleries
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/gallery/${s.slug}/${params.material}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-ui text-sm text-charcoal transition-colors hover:border-gray-400"
                >
                  {materialLabel} {s.shortTitle}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
