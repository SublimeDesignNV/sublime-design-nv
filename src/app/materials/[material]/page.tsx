import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import { ACTIVE_SERVICES } from "@/content/services";
import { db } from "@/lib/db";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: { material: string };
};

function labelFromSlug(slug: string) {
  // Special-case common abbreviations
  const overrides: Record<string, string> = {
    mdf: "MDF",
    hdf: "HDF",
    tfl: "TFL",
    hpl: "HPL",
    plam: "PLAM",
    "mdf-core": "MDF Core",
    "plywood-core": "Plywood Core",
    "white-oak": "White Oak",
    "hard-maple": "Hard Maple",
    "red-oak": "Red Oak",
    "rubio-monocoat": "Rubio Monocoat",
    "ml-campbell": "ML Campbell",
  };
  return overrides[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const label = labelFromSlug(params.material);
  const siteUrl = getSiteUrl();

  return {
    title: `${label} Cabinets & Built-Ins Las Vegas | Sublime Design NV`,
    description: `See real ${label} custom woodwork projects in Las Vegas, NV — cabinets, built-ins, shelves, and more. Photos from actual completed jobs. Free quotes available.`,
    alternates: { canonical: buildFacetCanonical(`/materials/${params.material}`) },
    openGraph: {
      title: `${label} Custom Woodwork Las Vegas | Sublime Design NV`,
      description: `Real ${label} projects built in Las Vegas. See photos and get a free quote.`,
      url: `${siteUrl}/materials/${params.material}`,
    },
    keywords: [
      `${label} cabinets Las Vegas`,
      `${label} built-ins Las Vegas`,
      `${label} custom woodwork Nevada`,
      `${label} shelves Las Vegas`,
      `custom ${label.toLowerCase()} contractor Las Vegas`,
    ].join(", "),
  };
}

export default async function MaterialDetailPage({ params }: Props) {
  const label = labelFromSlug(params.material);
  const siteUrl = getSiteUrl();

  // Match slug back to material string variants in DB
  const searchVariants = [
    label,
    params.material,
    params.material.replace(/-/g, " "),
  ];

  const assets = await db.asset.findMany({
    where: {
      published: true,
      kind: "IMAGE",
      materials: { hasSome: searchVariants },
    },
    select: {
      id: true,
      secureUrl: true,
      alt: true,
      primaryServiceSlug: true,
      location: true,
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  }).catch(() => []);

  if (assets.length === 0) {
    // Check if this material exists in DB at all — if not, 404
    const exists = await db.asset.findFirst({
      where: {
        published: true,
        kind: "IMAGE",
        materials: { hasSome: searchVariants },
      },
      select: { id: true },
    }).catch(() => null);

    if (!exists) notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} Custom Woodwork Las Vegas`,
    description: `Photos of ${label} cabinets, built-ins, and shelves built in Las Vegas, NV.`,
    url: `${siteUrl}/materials/${params.material}`,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      name: "Sublime Design NV",
      url: siteUrl,
    },
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
              { label: "Materials", href: "/materials" },
              { label: label, href: `/materials/${params.material}` },
            ]}
          />

          <p className="font-ui text-sm font-semibold uppercase tracking-[0.18em] text-red">
            Material Gallery
          </p>
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">
            {label}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-mid">
            Real {label} projects built and installed in Las Vegas, NV. Every photo is from an
            actual completed job — no renders, no stock.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/quote?material=${encodeURIComponent(label)}`}
              className="font-ui inline-flex rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Quote My {label} Project
            </Link>
            <Link
              href="/materials"
              className="font-ui inline-flex rounded-sm border border-gray-200 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
            >
              All Materials
            </Link>
          </div>

          {assets.length > 0 ? (
            <div className="mt-10 columns-2 gap-3 space-y-3 md:columns-3">
              {assets.map((asset) => (
                <div key={asset.id} className="break-inside-avoid overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.secureUrl}
                    alt={
                      asset.alt ??
                      `${label} custom woodwork${asset.location ? ` in ${asset.location}` : ""} Las Vegas`
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
                Photos coming soon for {label} projects.
              </p>
            </div>
          )}

          {/* Browse by service */}
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-charcoal">
              {label} by Service Type
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIVE_SERVICES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/gallery/${s.slug}/${params.material}`}
                  className="rounded-full border border-gray-200 px-3 py-1.5 font-ui text-sm text-charcoal transition-colors hover:border-gray-400"
                >
                  {label} {s.shortTitle}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
