import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import SitePhoto from "@/components/SitePhoto";
import { ACTIVE_SERVICES } from "@/content/services";
import { getServiceCardPreviewAsset } from "@/lib/portfolio.server";
import type { ServicePreviewAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical } from "@/lib/seo";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Custom Finish Carpentry Services | Sublime Design NV",
  description:
    "Floating shelves, media walls, faux beams, barn doors, mantels, cabinets, and trim work designed and installed throughout Las Vegas Valley.",
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
        <div className="relative h-64 overflow-hidden bg-cream">
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
          We design, build, and install premium finish carpentry throughout Las Vegas, Henderson,
          Summerlin, and the surrounding valley. The service structure stays focused on the high-value
          specialties homeowners ask for most.
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
              description={service.shortDescription}
            />
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm text-gray-mid">
          Each service page links through to relevant project examples so homeowners in Las Vegas,
          Henderson, and Summerlin can compare scope before requesting a quote.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <ReviewSourcePlaceholder compact />
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
            Start with a Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
