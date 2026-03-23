import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import SitePhoto from "@/components/SitePhoto";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { ACTIVE_AREAS } from "@/content/areas";
import { getServiceCardPreviewAsset, type ServicePreviewAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Areas We Serve | Sublime Design NV",
  description:
    "Explore the Las Vegas Valley areas served by Sublime Design NV, including Summerlin, Henderson, Las Vegas, Spring Valley, and Paradise.",
  alternates: {
    canonical: buildFacetCanonical("/areas"),
  },
};

function AreaCardImage({
  preview,
  title,
}: {
  preview: ServicePreviewAsset | null;
  title: string;
}) {
  if (!preview) {
    return (
      <div className="flex h-full items-center justify-center bg-cream">
        <span className="font-ui text-sm uppercase tracking-widest text-gray-mid">{title}</span>
      </div>
    );
  }

  if (preview.source === "cloudinary" && preview.publicId) {
    return (
      <SitePhoto
        publicId={preview.publicId}
        alt={preview.alt}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        mode="card"
        className="transition duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <Image
      src={preview.imageUrl}
      alt={preview.alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

async function AreaCard({
  slug,
  name,
  intro,
  relatedServiceSlug,
}: {
  slug: string;
  name: string;
  intro: string;
  relatedServiceSlug: string;
}) {
  const preview = await getServiceCardPreviewAsset(relatedServiceSlug).catch(() => null);

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/areas/${slug}`} className="block">
        <div className="relative h-64 overflow-hidden bg-cream">
          <AreaCardImage preview={preview} title={name} />
        </div>
      </Link>
      <div className="p-5">
        <p className="font-ui text-xs uppercase tracking-widest text-red">Area</p>
        <h2 className="mt-2 text-2xl text-charcoal">
          <Link href={`/areas/${slug}`} className="hover:text-red">
            {name}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-mid">{intro}</p>
        <div className="mt-5 flex flex-wrap gap-4">
          <TrackedLink
            href={`/areas/${slug}`}
            eventName="proof_cta_click"
            eventParams={{
              page_type: "area",
              area_slug: slug,
              destination_type: "area",
              destination_slug: slug,
              cta_location: "areas_index_card",
            }}
            className="font-ui text-sm font-semibold text-red hover:underline"
          >
            View Area
          </TrackedLink>
          <Link href="/quote" className="font-ui text-sm font-semibold text-navy hover:text-red">
            Start with a Quote
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function AreasIndexPage() {
  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Service Area</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Areas We Serve</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">
          Sublime Design NV serves homes across the Las Vegas Valley with measured, built, and installed finish carpentry.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-mid">
          Explore neighborhood pages for Summerlin, Henderson, Las Vegas, Spring Valley, and Paradise, then compare
          <Link href="/services" className="font-semibold text-red hover:underline"> services</Link>, browse
          <Link href="/projects" className="font-semibold text-red hover:underline"> recent projects</Link>, or
          <Link href="/quote" className="font-semibold text-red hover:underline"> start with a quote</Link>.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_AREAS.map((area) => (
            <AreaCard
              key={area.slug}
              slug={area.slug}
              name={area.name}
              intro={area.intro}
              relatedServiceSlug={area.relatedServiceSlugs[0]}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
