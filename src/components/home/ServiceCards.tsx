import Image from "next/image";
import Link from "next/link";
import SitePhoto from "@/components/SitePhoto";
import { HOMEPAGE_PRIMARY_SERVICES, HOMEPAGE_SECONDARY_SERVICES } from "@/content/services";
import { getServiceCardPreviewAsset } from "@/lib/portfolio.server";
import type { ServicePreviewAsset } from "@/lib/portfolio.server";

function CardImage({ preview, title }: { preview: ServicePreviewAsset | null; title: string }) {
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

async function ServiceCard({
  slug,
  shortTitle,
  shortDescription,
}: {
  slug: string;
  shortTitle: string;
  shortDescription: string;
}) {
  const preview = await getServiceCardPreviewAsset(slug).catch(() => null);

  return (
    <Link
      href={`/services/${slug}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-60 overflow-hidden bg-cream">
        <CardImage preview={preview} title={shortTitle} />
      </div>
      <div className="p-5">
        <h3 className="text-2xl text-charcoal">{shortTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-mid">{shortDescription}</p>
        <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
          Explore {shortTitle} →
        </span>
      </div>
    </Link>
  );
}

export default async function ServiceCards() {
  return (
    <div className="mt-10">
      {/* Primary grid — top 4 services */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {HOMEPAGE_PRIMARY_SERVICES.map((service) => (
          <ServiceCard
            key={service.slug}
            slug={service.slug}
            shortTitle={service.shortTitle}
            shortDescription={service.shortDescription}
          />
        ))}
      </div>

      {/* Secondary row — remaining active services + view all link */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-200 pt-5">
        <span className="font-ui text-xs uppercase tracking-widest text-gray-mid">Also</span>
        {HOMEPAGE_SECONDARY_SERVICES.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="font-ui text-sm font-medium text-charcoal transition hover:text-red"
          >
            {service.shortTitle}
          </Link>
        ))}
        <Link
          href="/services"
          className="font-ui ml-auto text-sm font-semibold text-red"
        >
          View All Services →
        </Link>
      </div>
    </div>
  );
}
