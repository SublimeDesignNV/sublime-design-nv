import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import { ACTIVE_AREAS, findArea } from "@/content/areas";
import { findService } from "@/content/services";
import { ACTIVE_SERVICES } from "@/content/services";
import { db } from "@/lib/db";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: { service: string; location: string };
};

function areaFromSlug(slug: string) {
  return findArea(slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = findService(params.service);
  const area = areaFromSlug(params.location);
  if (!service || !area) return { title: "Not Found | Sublime Design NV" };

  const siteUrl = getSiteUrl();
  const canonicalPath = `/services/${params.service}/${params.location}`;

  return {
    title: `${service.shortTitle} in ${area.name}, NV | Sublime Design NV`,
    description: `Custom ${service.shortTitle.toLowerCase()} contractor serving ${area.name}, Nevada. See real project photos, materials used, and get a free quote.`,
    alternates: { canonical: buildFacetCanonical(canonicalPath) },
    openGraph: {
      title: `${service.shortTitle} in ${area.name}, NV | Sublime Design NV`,
      description: `Custom ${service.shortTitle.toLowerCase()} installations in ${area.name}, NV. Built to spec — see real jobs from real homes.`,
      url: `${siteUrl}${canonicalPath}`,
    },
    keywords: [
      `${service.shortTitle} ${area.name}`,
      `${service.shortTitle} ${area.name} NV`,
      `custom ${service.shortTitle.toLowerCase()} ${area.name}`,
      `${service.shortTitle.toLowerCase()} contractor ${area.name}`,
      `${service.shortTitle.toLowerCase()} Las Vegas`,
    ].join(", "),
  };
}

export default async function ServiceLocationPage({ params }: Props) {
  const service = findService(params.service);
  const area = areaFromSlug(params.location);
  if (!service || !area) notFound();

  const siteUrl = getSiteUrl();

  const assets = await db.asset.findMany({
    where: {
      published: true,
      kind: "IMAGE",
      primaryServiceSlug: params.service,
      location: { contains: area.name, mode: "insensitive" },
    },
    select: { id: true, secureUrl: true, alt: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const otherAreas = ACTIVE_AREAS.filter((a) => a.slug !== area.slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.shortTitle} in ${area.name}, NV`,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "Sublime Design NV",
      url: siteUrl,
      telephone: "+17028479016",
    },
    serviceType: service.shortTitle,
    areaServed: { "@type": "Place", name: `${area.name}, Nevada` },
    url: `${siteUrl}/services/${params.service}/${params.location}`,
    ...(assets[0]?.secureUrl ? { image: assets[0].secureUrl } : {}),
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
              { label: "Services", href: "/services" },
              { label: service.shortTitle, href: `/services/${params.service}` },
              { label: area.name, href: `/services/${params.service}/${params.location}` },
            ]}
          />

          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            {area.name}, Nevada
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">
            {service.shortTitle} in {area.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-mid">
            Custom {service.shortTitle.toLowerCase()} installations in {area.name}, NV. Every
            project is built to spec — see real work from real homes in your neighborhood.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/quote?service=${params.service}&location=${area.name}`}
              className="font-ui inline-flex rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Get a Free Quote in {area.name}
            </Link>
            <Link
              href={`/services/${params.service}`}
              className="font-ui inline-flex rounded-sm border border-gray-200 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
            >
              About {service.shortTitle}
            </Link>
          </div>

          {assets.length > 0 ? (
            <div className="mt-10 columns-2 gap-3 space-y-3 md:columns-3">
              {assets.map((asset) => (
                <div key={asset.id} className="break-inside-avoid overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.secureUrl}
                    alt={asset.alt ?? `${service.shortTitle} in ${area.name}, NV`}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-xl border border-gray-200 bg-cream px-8 py-16 text-center">
              <p className="font-ui text-base text-gray-mid">
                Photos coming soon for {area.name}.
              </p>
              <Link
                href={`/quote?service=${params.service}&location=${area.name}`}
                className="font-ui mt-4 inline-block text-sm font-semibold text-red hover:underline"
              >
                Request a quote for your {area.name} home →
              </Link>
            </div>
          )}

          <section className="mt-16">
            <h2 className="text-xl font-semibold text-charcoal">
              {service.shortTitle} Across Las Vegas Valley
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherAreas.map((a) => (
                <Link
                  key={a.slug}
                  href={`/services/${params.service}/${a.slug}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-ui text-sm text-charcoal transition-colors hover:border-gray-400"
                >
                  {a.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-charcoal">
              Other Services in {area.name}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIVE_SERVICES.filter((s) => s.slug !== params.service).map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}/${params.location}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-ui text-sm text-charcoal transition-colors hover:border-gray-400"
                >
                  {s.shortTitle}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
