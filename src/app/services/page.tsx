import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import CloudinaryImage from "@/components/CloudinaryImage";
import { ACTIVE_SERVICES } from "@/content/services";
import { getServiceCardPreviewAsset } from "@/lib/portfolio.server";
import type { ServicePreviewAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Finish Carpentry Services | Sublime Design NV",
  description:
    "Custom floating shelves, built-ins, pantry pullouts, closet systems, cabinetry, and mantels — designed and installed throughout Las Vegas, Henderson, and Summerlin.",
  alternates: {
    canonical: buildFacetCanonical("/services"),
  },
};

function ServiceCardImage({
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
      <CloudinaryImage
        src={preview.publicId}
        alt={preview.alt}
        width={800}
        height={520}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Image
      src={preview.secureUrl}
      alt={preview.alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

async function ServiceIndexCard({
  slug,
  shortTitle,
  description,
}: {
  slug: string;
  shortTitle: string;
  description: string;
}) {
  const preview = await getServiceCardPreviewAsset(slug).catch(() => null);

  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/services/${slug}`} className="block">
        <div className="relative h-56 overflow-hidden bg-cream">
          <ServiceCardImage preview={preview} title={shortTitle} />
        </div>
      </Link>
      <div className="p-5">
        <h2 className="text-xl font-medium text-charcoal">
          <Link href={`/services/${slug}`} className="hover:text-red">
            {shortTitle}
          </Link>
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-mid">{description}</p>
        <Link
          href={`/services/${slug}`}
          className="font-ui mt-4 inline-block text-sm font-semibold text-red"
        >
          Learn More →
        </Link>
      </div>
    </article>
  );
}

export default async function ServicesIndexPage() {
  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      {/* Header */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="font-ui text-sm uppercase tracking-widest text-red">Finish Carpentry</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">Services</h1>
        <p className="mt-4 max-w-3xl text-base text-gray-mid">
          We design, build, and install custom finish carpentry throughout Las Vegas, Henderson,
          Summerlin, and the surrounding valley. Every job is measured, shop-built, and installed
          to fit your exact space.
        </p>
      </section>

      {/* Service grid */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_SERVICES.map((service) => (
            <ServiceIndexCard
              key={service.slug}
              slug={service.slug}
              shortTitle={service.shortTitle}
              description={service.description}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">Not sure where to start?</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Describe your project and we will help you figure out the right approach, scope,
            and budget range before committing to anything.
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
