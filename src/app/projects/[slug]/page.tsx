import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import ProjectCard from "@/components/projects/ProjectCard";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";
import { findProject, getProjectsByService } from "@/content/projects";
import { getRelatedReviews } from "@/content/reviews";
import { findService } from "@/content/services";
import type { TestimonialDef } from "@/content/testimonials";
import { findTestimonial, getTestimonialsByProject } from "@/content/testimonials";
import { getProjectImages } from "@/lib/portfolio.server";
import type { ProjectImageAsset } from "@/lib/portfolio.server";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";

const CTA_TRUST_ITEMS = ["Free quote", "Local install", "Built to fit", "Clear next steps"] as const;

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject(params.slug);
  if (!project) {
    return {
      title: "Project Not Found | Sublime Design NV",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: project.seoTitle,
    description: project.seoDescription,
    alternates: {
      canonical: buildFacetCanonical(`/projects/${project.slug}`),
    },
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProjectImage({ asset, sizes }: { asset: ProjectImageAsset; sizes: string }) {
  if (asset.source === "cloudinary" && asset.publicId) {
    return (
      <CloudinaryImage
        src={asset.publicId}
        alt={asset.alt}
        width={1400}
        height={900}
        sizes={sizes}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <Image
      src={asset.secureUrl}
      alt={asset.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  );
}

function ProjectGallery({ images }: { images: ProjectImageAsset[] }) {
  if (!images.length) return null;

  if (images.length === 1) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "480px" }}>
        <ProjectImage asset={images[0]} sizes="100vw" />
      </div>
    );
  }

  if (images.length <= 3) {
    const [first, ...rest] = images;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ minHeight: "340px" }}>
          <ProjectImage asset={first} sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col gap-4">
          {rest.map((asset, i) => (
            <div
              key={asset.secureUrl + i}
              className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
              style={{ minHeight: "160px" }}
            >
              <ProjectImage asset={asset} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((asset, i) => (
        <div
          key={asset.secureUrl + i}
          className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          style={{ height: "260px" }}
        >
          <ProjectImage asset={asset} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
      ))}
    </div>
  );
}

function ProjectStructuredData({
  slug,
  title,
  description,
  city,
  state,
  images,
  testimonial,
}: {
  slug: string;
  title: string;
  description: string;
  city: string;
  state: string;
  images: ProjectImageAsset[];
  testimonial?: TestimonialDef;
}) {
  const siteUrl = getSiteUrl();
  const projectUrl = `${siteUrl}/projects/${slug}`;

  const review = testimonial
    ? {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: testimonial.rating ?? 5,
          bestRating: 5,
        },
        author: { "@type": "Person", name: testimonial.name },
        reviewBody: testimonial.quote,
      }
    : undefined;

  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    image: images.slice(0, 3).map((img) => img.secureUrl),
    locationCreated: {
      "@type": "Place",
      name: `${city}, ${state}`,
    },
    url: projectUrl,
    ...(review ? { review } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectDetailPage({ params }: Props) {
  const project = findProject(params.slug);
  if (!project) notFound();

  const images = await getProjectImages(project.slug, project.galleryServiceSlug ?? project.serviceSlug);

  const serviceDef = findService(project.serviceSlug);
  const relatedServiceDefs = project.relatedServices
    .map((s) => findService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const relatedProjects = getProjectsByService(project.serviceSlug)
    .filter((candidate) => candidate.slug !== project.slug)
    .slice(0, 2);

  // Testimonial: prefer linked slug, fall back to any project-linked testimonial
  const linkedTestimonial = project.testimonialSlug
    ? findTestimonial(project.testimonialSlug)
    : getTestimonialsByProject(project.slug)[0];
  const relatedReviews = getRelatedReviews({
    projectSlug: project.slug,
    serviceSlug: project.serviceSlug,
    limit: 1,
  });
  const proofReview = relatedReviews[0];
  const hasDistinctReview =
    Boolean(proofReview) &&
    (!linkedTestimonial ||
      linkedTestimonial.quote !== proofReview?.quote ||
      linkedTestimonial.name !== proofReview?.name);

  const heroImage = images[0];
  const serviceLabel =
    serviceDef?.shortTitle ?? project.serviceSlug.replace(/-/g, " ");
  const projectCtaHeading = `Planning similar ${serviceLabel.toLowerCase()} in ${project.location.cityLabel}?`;
  const projectCtaCopy = `Tell us about the space and we will reply with the next step for ${serviceLabel.toLowerCase()}, schedule, and quote guidance.`;

  return (
    <main className="bg-white pb-24 pt-24">
      <LocalBusinessSchema />
      <ProjectStructuredData
        slug={project.slug}
        title={project.title}
        description={project.seoDescription}
        city={project.location.cityLabel}
        state={project.location.state}
        images={images}
        testimonial={linkedTestimonial}
      />

      {/* ── 1. Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <BreadcrumbTrail
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Projects", href: "/projects" },
            { label: project.title, href: `/projects/${project.slug}` },
          ]}
        />

        <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">
          {serviceLabel} • {project.location.cityLabel}
        </p>
        {project.flagship ? (
          <p className="mt-3 inline-flex rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.18em] text-red">
            Flagship Project
          </p>
        ) : null}
        <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{project.title}</h1>
        <p className="mt-2 text-base text-gray-mid">
          {project.location.cityLabel}, {project.location.state} &middot; {project.year}
        </p>

        {heroImage ? (
          <div className="mt-8 relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "480px" }}>
            <ProjectImage asset={heroImage} sizes="100vw" />
          </div>
        ) : null}
      </section>

      {/* ── 2. Summary ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <p className="max-w-3xl text-lg leading-8 text-charcoal/90">{project.summary}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-mid">
          Need similar {serviceLabel.toLowerCase()} in{" "}
          {project.location.cityLabel}? Visit the{" "}
          <Link href={`/services/${project.serviceSlug}`} className="font-semibold text-red hover:underline">
            {serviceLabel} service page
          </Link>
          {" "}or{" "}
          <Link href="/quote" className="font-semibold text-red hover:underline">
            start with a quote
          </Link>
          .
        </p>
      </section>

      {/* ── 3. Challenge ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="font-ui text-xs uppercase tracking-widest text-red">The Challenge</p>
            <p className="mt-3 text-base leading-7 text-charcoal/80">{project.challenge}</p>
          </div>

          {/* ── 4. Solution ── */}
          <div>
            <p className="font-ui text-xs uppercase tracking-widest text-red">Our Solution</p>
            <p className="mt-3 text-base leading-7 text-charcoal/80">{project.solution}</p>
          </div>
        </div>
      </section>

      {/* ── 5. Materials + Timeline ──────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Service</p>
            <p className="mt-2 text-base font-medium text-charcoal">
              {serviceLabel}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Location</p>
            <p className="mt-2 text-base font-medium text-charcoal">
              {project.location.cityLabel}, {project.location.state}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Timeline</p>
            <p className="mt-2 text-base font-medium text-charcoal">{project.timeline}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Year</p>
            <p className="mt-2 text-base font-medium text-charcoal">{project.year}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 bg-cream p-5">
          <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Materials</p>
          <p className="mt-2 text-base text-charcoal">{project.materials}</p>
        </div>
      </section>

      {/* ── 6. Gallery ───────────────────────────────────────────────── */}
      {images.length > 1 ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <h2 className="text-3xl text-charcoal">Project Gallery</h2>
          <div className="mt-6">
            <ProjectGallery images={images.slice(1)} />
          </div>
        </section>
      ) : null}

      {hasDistinctReview ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <ReviewSourcePlaceholder
            reviews={[proofReview as NonNullable<typeof proofReview>]}
            compact
            eyebrow="Client Review"
            title={`Proof from ${project.location.cityLabel}`}
            subheading={`A recent homeowner review related to ${serviceLabel.toLowerCase()} work like this project.`}
            emptyBehavior="hide"
          />
        </section>
      ) : null}

      {/* ── 7. Testimonial (if available) ────────────────────────────── */}
      {linkedTestimonial ? (
        <section className="bg-cream py-16 mt-16">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <blockquote>
              <p className="text-2xl leading-relaxed text-charcoal md:text-3xl">
                &ldquo;{linkedTestimonial.quote}&rdquo;
              </p>
              <footer className="mt-6">
                <p className="font-ui text-sm font-semibold text-charcoal">{linkedTestimonial.name}</p>
                <p className="font-ui text-sm text-gray-mid">{linkedTestimonial.location}</p>
                {linkedTestimonial.sourceLabel ? (
                  <p className="font-ui mt-1 text-xs text-gray-mid">{linkedTestimonial.sourceLabel}</p>
                ) : null}
              </footer>
            </blockquote>
          </div>
        </section>
      ) : null}

      {/* ── 8. Related Services ──────────────────────────────────────── */}
      {relatedServiceDefs.length > 0 ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <h2 className="text-2xl text-charcoal">Related Services</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {relatedServiceDefs.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="rounded-lg border border-gray-200 bg-cream px-5 py-3 text-sm font-medium text-charcoal transition hover:border-red hover:text-red"
              >
                {service.shortTitle}
              </Link>
            ))}
            <Link
              href="/services"
              className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-mid transition hover:border-red hover:text-red"
            >
              All Services →
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── 9. More Projects ─────────────────────────────────────────── */}
      {relatedProjects.length > 0 ? (
        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl text-charcoal">More Projects</h2>
            <Link href="/projects" className="font-ui text-sm font-semibold text-red">
              View All →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {relatedProjects.map((related) => (
              <ProjectCard
                key={related.slug}
                project={related}
                priorityLabel={related.flagship ? "Flagship" : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── 10. Quote CTA ────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">{projectCtaHeading}</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            {projectCtaCopy}
          </p>
          <Link
            href="/quote"
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            Start with a {serviceLabel} Quote
          </Link>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5">
            {CTA_TRUST_ITEMS.map((item) => (
              <span key={item} className="font-ui text-xs text-white/70">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
