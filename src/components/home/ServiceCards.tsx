import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import { ACTIVE_SERVICES } from "@/content/services";
import { getServiceCardPreviewAsset } from "@/lib/portfolio.server";

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
      <div className="relative h-52 overflow-hidden bg-cream">
        {preview ? (
          <CloudinaryImage
            src={preview.publicId}
            alt={preview.alt}
            width={800}
            height={520}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cream">
            <span className="font-ui text-sm uppercase tracking-widest text-gray-mid">
              {shortTitle}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-2xl text-charcoal">{shortTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-mid">{shortDescription}</p>
        <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
          Learn More →
        </span>
      </div>
    </Link>
  );
}

export default async function ServiceCards() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {ACTIVE_SERVICES.map((service) => (
        <ServiceCard
          key={service.slug}
          slug={service.slug}
          shortTitle={service.shortTitle}
          shortDescription={service.shortDescription}
        />
      ))}
    </div>
  );
}
