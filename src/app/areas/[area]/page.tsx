import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import CloudinaryImage from "@/components/CloudinaryImage";
import ProjectCard from "@/components/projects/ProjectCard";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { findArea, getAreaProjects, getAreaReviews, getAreaServices } from "@/content/areas";
import { getServiceCardPreviewAsset, type ServicePreviewAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    area: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = findArea(params.area);
  if (!area || (area.status ?? "active") !== "active") {
    return {
      title: "Area Not Found | Sublime Design NV",
      description: "The requested service area could not be found.",
    };
  }

  return {
    title: area.seoTitle,
    description: area.seoDescription,
    alternates: {
      canonical: buildFacetCanonical(`/areas/${area.slug}`),
    },
  };
}

function ServicePreview({
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
        height={560}
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

async function AreaServiceCard({
  areaSlug,
  serviceSlug,
  title,
  description,
}: {
  areaSlug: string;
  serviceSlug: string;
  title: string;
  description: string;
}) {
  const preview = await getServiceCardPreviewAsset(serviceSlug).catch(() => null);

  return (
    <TrackedLink
      href={`/services/${serviceSlug}`}
      eventName="proof_cta_click"
      eventParams={{
        page_type: "area",
        area_slug: areaSlug,
        destination_type: "service",
        destination_slug: serviceSlug,
        cta_location: "area_service_card",
      }}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-cream">
        <ServicePreview preview={preview} title={title} />
      </div>
      <div className="p-5">
        <p className="font-ui text-xs uppercase tracking-widest text-red">Service</p>
        <h3 className="mt-2 text-xl text-charcoal">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-gray-mid">{description}</p>
        <span className="font-ui mt-4 inline-block text-sm font-semibold text-red">
          View Service
        </span>
      </div>
    </TrackedLink>
  );
}

export default async function AreaDetailPage({ params }: Props) {
  const area = findArea(params.area);
  if (!area || (area.status ?? "active") !== "active") notFound();

  const areaServices = getAreaServices(area.slug).slice(0, 6);
  const areaProjects = getAreaProjects(area.slug).slice(0, 3);
  const areaReviews = getAreaReviews(area.slug).slice(0, 3);
  const nearbyAreas = area.nearbyAreas
    .map((slug) => findArea(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <BreadcrumbTrail
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Areas", href: "/areas" },
            { label: area.name, href: `/areas/${area.slug}` },
          ]}
        />
        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Area</p>
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{area.heroHeadline}</h1>
        <p className="mt-4 max-w-3xl text-lg text-gray-mid">{area.heroBody}</p>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4 md:px-8">
        <p className="max-w-3xl text-base leading-7 text-charcoal/80">{area.intro}</p>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-charcoal">Services in {area.name}</h2>
          <TrackedLink
            href="/services"
            eventName="proof_cta_click"
            eventParams={{
              page_type: "area",
              area_slug: area.slug,
              destination_type: "services",
              cta_location: "area_services_header",
            }}
            className="font-ui text-sm font-semibold text-red"
          >
            View All Services →
          </TrackedLink>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areaServices.map((service) => (
            <AreaServiceCard
              key={service.slug}
              areaSlug={area.slug}
              serviceSlug={service.slug}
              title={service.shortTitle}
              description={service.shortDescription}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl text-charcoal">Projects in {area.name}</h2>
          <TrackedLink
            href="/projects"
            eventName="proof_cta_click"
            eventParams={{
              page_type: "area",
              area_slug: area.slug,
              destination_type: "projects",
              cta_location: "area_projects_header",
            }}
            className="font-ui text-sm font-semibold text-red"
          >
            View All Projects →
          </TrackedLink>
        </div>
        {areaProjects.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {areaProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} pageType="area" />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-gray-200 bg-cream p-6">
            <p className="text-sm text-gray-mid">
              Project photos for {area.name} are still being added. We can share nearby examples that fit the job when we quote it.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <ReviewSourcePlaceholder
          reviews={areaReviews}
          compact
          eyebrow="Client Reviews"
          title={`Proof from ${area.name}`}
          subheading={`Recent homeowner feedback connected to work in ${area.serviceAreaLabel} and the surrounding Las Vegas Valley.`}
          emptyBehavior="hide"
          pageType="area"
          showCompactCta
          ctaHref="/quote"
          ctaLabel="Start with a Quote"
          eventContext="area_proof_cta"
        />
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl border border-gray-200 bg-cream p-6">
          <p className="font-ui text-xs uppercase tracking-widest text-red">Service Area</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-mid">
            We work throughout {area.serviceAreaLabel} and the wider Las Vegas Valley. Nearby areas include{" "}
            {nearbyAreas.map((nearby, index) => (
              <span key={nearby.slug}>
                {index > 0 ? ", " : ""}
                <TrackedLink
                  href={`/areas/${nearby.slug}`}
                  eventName="proof_cta_click"
                  eventParams={{
                    page_type: "area",
                    area_slug: area.slug,
                    destination_type: "area",
                    destination_slug: nearby.slug,
                    cta_location: "nearby_areas",
                  }}
                  className="font-semibold text-red hover:underline"
                >
                  {nearby.name}
                </TrackedLink>
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">Start your {area.name} project.</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            Tell us what you have in mind and we will reply with next steps, scope guidance, and quote options for work in {area.serviceAreaLabel}.
          </p>
          <TrackedLink
            href="/quote"
            eventName="proof_cta_click"
            eventParams={{
              page_type: "area",
              area_slug: area.slug,
              destination_type: "quote",
              cta_location: "area_quote_cta",
            }}
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            Start with a Quote
          </TrackedLink>
        </div>
      </section>
    </main>
  );
}
