import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackedLink from "@/components/analytics/TrackedLink";
import CloudinaryImage from "@/components/CloudinaryImage";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectRecordCard from "@/components/projects/ProjectRecordCard";
import BreadcrumbTrail from "@/components/seo/BreadcrumbTrail";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import ReviewSourcePlaceholder from "@/components/reviews/ReviewSourcePlaceholder";
import { findArea } from "@/content/areas";
import { findProject, getProjectsByService } from "@/content/projects";
import { getRelatedReviews } from "@/content/reviews";
import { findService } from "@/content/services";
import type { TestimonialDef } from "@/content/testimonials";
import { findTestimonial, getTestimonialsByProject } from "@/content/testimonials";
import { getProjectContentAuditRowBySlug } from "@/lib/contentAudit.server";
import { getProjectCardPreviewAsset, getProjectImages } from "@/lib/portfolio.server";
import type { ProjectImageAsset } from "@/lib/portfolio.server";
import {
  getProjectExcerpt,
  getPublicProjectDescription,
  getPublicProjectEyebrow,
  getPublicProjectTitle,
  getProjectQuoteHref,
  getProjectRecordBySlug,
  getValidatedProjectPrimaryCta,
  listPublicProjects,
} from "@/lib/projectRecords.server";
import { buildFacetCanonical, getSiteUrl } from "@/lib/seo";

const CTA_TRUST_ITEMS = ["Free quote", "Local install", "Built to fit", "Clear next steps"] as const;

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const linkedProject = await getProjectRecordBySlug(params.slug);
  if (linkedProject && linkedProject.published && linkedProject.diagnosis === "renderable_project") {
    const publicTitle = getPublicProjectTitle(linkedProject);
    return {
      title: `${publicTitle} | Sublime Design NV`,
      description: getProjectExcerpt(linkedProject, 155),
      alternates: {
        canonical: buildFacetCanonical(`/projects/${linkedProject.slug}`),
      },
      openGraph: {
        title: `${publicTitle} | Sublime Design NV`,
        description: getProjectExcerpt(linkedProject, 155),
        url: buildFacetCanonical(`/projects/${linkedProject.slug}`),
        images: linkedProject.coverImageUrl
          ? [{ url: linkedProject.coverImageUrl, alt: publicTitle }]
          : undefined,
      },
    };
  }

  const project = findProject(params.slug);
  if (!project) {
    return {
      title: "Project Not Found | Sublime Design NV",
      description: "The requested project could not be found.",
    };
  }

  const service = findService(project.serviceSlug);
  const readiness = await getProjectContentAuditRowBySlug(project.slug);
  const heroAsset = await getProjectCardPreviewAsset(
    project.slug,
    project.galleryServiceSlug ?? project.serviceSlug,
  ).catch(() => null);
  const openGraphTitle = `${project.title} | ${service?.shortTitle ?? "Project"} in ${project.location.cityLabel}`;
  const openGraphDescription =
    project.intro ??
    `${project.summary} Completed in ${project.location.cityLabel}, ${project.location.state}.`;

  return {
    title: project.seoTitle,
    description: `${project.summary} Completed in ${project.location.cityLabel}, ${project.location.state}.`,
    alternates: {
      canonical: buildFacetCanonical(`/projects/${project.slug}`),
    },
    robots: readiness?.shouldNoindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: openGraphTitle,
      description: openGraphDescription,
      url: buildFacetCanonical(`/projects/${project.slug}`),
      images: heroAsset?.secureUrl
        ? [
            {
              url: heroAsset.secureUrl,
              alt: heroAsset.alt,
            },
          ]
        : undefined,
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
      src={asset.imageUrl}
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
      <figure>
        <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "480px" }}>
          <ProjectImage asset={images[0]} sizes="100vw" />
        </div>
        {images[0].caption ? (
          <figcaption className="mt-3 text-sm leading-6 text-gray-mid">{images[0].caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  if (images.length <= 3) {
    const [first, ...rest] = images;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <figure>
          <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ minHeight: "340px" }}>
            <ProjectImage asset={first} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          {first.caption ? (
            <figcaption className="mt-3 rounded-xl border border-gray-200 bg-cream px-4 py-3 text-sm leading-6 text-charcoal/80">
              {first.caption}
            </figcaption>
          ) : null}
        </figure>
        <div className="flex flex-col gap-4">
          {rest.map((asset, i) => (
            <figure key={asset.secureUrl + i}>
              <div
                className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
                style={{ minHeight: "160px" }}
              >
                <ProjectImage asset={asset} sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((asset, i) => (
        <figure key={asset.secureUrl + i}>
          <div
            className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            style={{ height: "260px" }}
          >
            <ProjectImage asset={asset} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
          {i === 0 && asset.caption ? (
            <figcaption className="mt-3 rounded-xl border border-gray-200 bg-cream px-4 py-3 text-sm leading-6 text-charcoal/80">
              {asset.caption}
            </figcaption>
          ) : null}
        </figure>
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
  const linkedProject = await getProjectRecordBySlug(params.slug);
  if (linkedProject && linkedProject.published && linkedProject.diagnosis === "renderable_project") {
    const publicTitle = getPublicProjectTitle(linkedProject);
    const publicDescription = getPublicProjectDescription(linkedProject);
    const publicEyebrow = getPublicProjectEyebrow(linkedProject);
    const images: ProjectImageAsset[] = linkedProject.assets
      .filter((asset) => asset.published && asset.renderable && asset.imageUrl)
      .map((asset) => ({
        publicId: asset.publicId ?? undefined,
        imageUrl: asset.imageUrl ?? "",
        secureUrl: asset.secureUrl ?? asset.imageUrl ?? "",
        alt: asset.title || publicTitle,
        source: asset.publicId ? "cloudinary" : "seed",
        caption: asset.location ?? undefined,
      }));

    const relatedLinkedProjects = (
      await listPublicProjects({
        serviceSlug: linkedProject.serviceSlug ?? undefined,
        limit: 3,
      })
    ).filter((project) => project.slug !== linkedProject.slug);
    const heroImage = images[0];
    const relatedReviews = getRelatedReviews({
      projectSlug: linkedProject.slug,
      serviceSlug: linkedProject.serviceSlug ?? undefined,
      limit: 2,
    });
    const customCta = getValidatedProjectPrimaryCta(linkedProject);
    const quoteHref = getProjectQuoteHref(linkedProject, {
      sourceType: "project-page",
      sourcePath: `/projects/${linkedProject.slug}`,
      ctaLabel: customCta?.label ?? "Start Your Project",
    });
    const summaryCopy =
      publicDescription ||
      "A finished custom project designed for the space, photographed to show the details, layout, and final fit.";

    return (
      <main className="bg-white pb-24 pt-24">
        <LocalBusinessSchema />
        <ProjectStructuredData
          slug={linkedProject.slug}
          title={publicTitle}
          description={publicDescription || publicTitle}
          city={linkedProject.areaLabel ?? linkedProject.location ?? "Las Vegas Valley"}
          state="NV"
          images={images}
        />

        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <BreadcrumbTrail
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: publicTitle, href: `/projects/${linkedProject.slug}` },
            ]}
          />
          <p className="font-ui text-sm uppercase tracking-[0.18em] text-red">Featured Work</p>
          {publicEyebrow ? (
            <p className="mt-3 font-ui text-xs uppercase tracking-[0.18em] text-red">
              {publicEyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-4xl text-charcoal md:text-5xl">{publicTitle}</h1>
          <p className="mt-3 max-w-3xl text-base text-gray-mid">{summaryCopy}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {linkedProject.featured ? (
              <span className="rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
                Featured Project
              </span>
            ) : null}
            {linkedProject.serviceLabel ? (
              <span className="rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
                {linkedProject.serviceLabel}
              </span>
            ) : null}
            {linkedProject.areaLabel ? (
              <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                {linkedProject.areaLabel}
              </span>
            ) : null}
            {linkedProject.location ? (
              <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                {linkedProject.location}
              </span>
            ) : null}
            {linkedProject.completionYear ? (
              <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                Completed {linkedProject.completionYear}
              </span>
            ) : null}
            <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
              {linkedProject.assetCount} image{linkedProject.assetCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href={customCta?.href ?? quoteHref}
              eventName="proof_cta_click"
              eventParams={{
                page_type: "project",
                project_slug: linkedProject.slug,
                cta_location: "project_primary_cta",
              }}
              className="font-ui inline-flex rounded-sm bg-red px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {customCta?.label ?? "Start Your Project"}
            </TrackedLink>
            <TrackedLink
              href="/projects"
              eventName="proof_cta_click"
              eventParams={{
                page_type: "project",
                project_slug: linkedProject.slug,
                cta_location: "project_all_projects_cta",
              }}
              className="font-ui inline-flex rounded-sm border border-gray-200 px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-red hover:text-red"
            >
              View All Projects
            </TrackedLink>
          </div>

          {heroImage ? (
            <figure className="mt-8">
              <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "480px" }}>
                <ProjectImage asset={heroImage} sizes="100vw" />
              </div>
              {heroImage.caption ? (
                <figcaption className="mt-3 max-w-3xl text-sm leading-6 text-gray-mid">
                  {heroImage.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </section>

        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="font-ui text-xs uppercase tracking-widest text-red">Project Story</p>
              <p className="mt-4 text-base leading-7 text-charcoal/85">{summaryCopy}</p>
              <p className="mt-4 text-sm leading-6 text-gray-mid">
                The gallery below offers a closer look at the finishes, fit, and details that define the completed space.
              </p>
            </article>
            <aside className="rounded-xl border border-gray-200 bg-cream p-6">
              <p className="font-ui text-xs uppercase tracking-widest text-red">Project Details</p>
              <dl className="mt-4 space-y-4">
                {linkedProject.serviceLabel ? (
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Service</dt>
                    <dd className="mt-1 text-sm text-charcoal">{linkedProject.serviceLabel}</dd>
                  </div>
                ) : null}
                {linkedProject.areaLabel ? (
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Area</dt>
                    <dd className="mt-1 text-sm text-charcoal">{linkedProject.areaLabel}</dd>
                  </div>
                ) : null}
                {linkedProject.location ? (
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Location</dt>
                    <dd className="mt-1 text-sm text-charcoal">{linkedProject.location}</dd>
                  </div>
                ) : null}
                {linkedProject.completionYear ? (
                  <div>
                    <dt className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Completion</dt>
                    <dd className="mt-1 text-sm text-charcoal">{linkedProject.completionYear}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </section>

        {images.length > 1 ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-ui text-xs uppercase tracking-widest text-red">Gallery</p>
                <h2 className="mt-2 text-3xl text-charcoal">Project Gallery</h2>
              </div>
              <p className="max-w-xl text-sm text-gray-mid">
                A look through the finished project photos, from the overall space to the finer details.
              </p>
            </div>
            <div className="mt-6">
              <ProjectGallery images={images.slice(1)} />
            </div>
          </section>
        ) : null}

        {linkedProject.testimonialPresent && relatedReviews.length ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
            <ReviewSourcePlaceholder
              reviews={relatedReviews}
              compact
              eyebrow="Client Review"
              title="What the client noticed"
              subheading="Supporting review content tied to this project when review proof is available."
              emptyBehavior="hide"
              pageType="project"
              showCompactCta={false}
              eventContext="project_review_proof"
            />
          </section>
        ) : null}

        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <div className="rounded-xl border border-gray-200 bg-cream p-6">
            <p className="font-ui text-xs uppercase tracking-widest text-red">Explore Related Pages</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {linkedProject.serviceSlug && linkedProject.serviceLabel ? (
                <TrackedLink
                  href={`/services/${linkedProject.serviceSlug}`}
                  eventName="proof_cta_click"
                  eventParams={{
                    page_type: "project",
                    project_slug: linkedProject.slug,
                    destination_type: "service",
                    destination_slug: linkedProject.serviceSlug,
                    cta_location: "project_related_service",
                  }}
                  className="font-ui rounded-sm border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:border-red hover:text-red"
                >
                  {linkedProject.serviceLabel}
                </TrackedLink>
              ) : null}
              {linkedProject.areaSlug && linkedProject.areaLabel ? (
                <TrackedLink
                  href={`/areas/${linkedProject.areaSlug}`}
                  eventName="proof_cta_click"
                  eventParams={{
                    page_type: "project",
                    project_slug: linkedProject.slug,
                    destination_type: "area",
                    destination_slug: linkedProject.areaSlug,
                    cta_location: "project_related_area",
                  }}
                  className="font-ui rounded-sm border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:border-red hover:text-red"
                >
                  {linkedProject.areaLabel}
                </TrackedLink>
              ) : null}
              <TrackedLink
                href="/projects"
                eventName="proof_cta_click"
                eventParams={{
                  page_type: "project",
                  project_slug: linkedProject.slug,
                  destination_type: "projects",
                  cta_location: "project_related_projects_index",
                }}
                className="font-ui rounded-sm border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:border-red hover:text-red"
              >
                All Projects
              </TrackedLink>
            </div>
          </div>
        </section>

        {relatedLinkedProjects.length ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-ui text-xs uppercase tracking-widest text-red">Related Work</p>
                <h2 className="mt-2 text-2xl text-charcoal">More Projects</h2>
              </div>
              <Link href="/projects" className="font-ui text-sm font-semibold text-red">
                View All →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {relatedLinkedProjects.slice(0, 2).map((project) => (
                <ProjectRecordCard key={project.id} project={project} pageType="projects" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
          <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
            <h2 className="text-3xl md:text-4xl">Take the next step.</h2>
            <p className="mt-3 max-w-2xl text-white/90">
              Use this project as a starting point if the service, finish, or room direction is close to what you want. We will reply with scope, timeline, and quote guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={customCta?.href ?? quoteHref}
                eventName="proof_cta_click"
                eventParams={{
                  page_type: "project",
                  project_slug: linkedProject.slug,
                  cta_location: "project_quote_cta",
                }}
                className="font-ui inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
              >
                {customCta?.label ?? "Start Your Project"}
              </TrackedLink>
              {linkedProject.serviceSlug && linkedProject.serviceLabel ? (
                <TrackedLink
                  href={`/services/${linkedProject.serviceSlug}`}
                  eventName="proof_cta_click"
                  eventParams={{
                    page_type: "project",
                    project_slug: linkedProject.slug,
                    destination_type: "service",
                    destination_slug: linkedProject.serviceSlug,
                    cta_location: "project_service_cta",
                  }}
                  className="font-ui inline-block rounded-sm border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  See {linkedProject.serviceLabel}
                </TrackedLink>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    );
  }

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
  const projectArea = findArea(project.location.city);
  const projectCtaHeading = `Planning similar ${serviceLabel.toLowerCase()} in ${project.location.cityLabel}?`;
  const projectCtaCopy =
    project.ctaLine ??
    `Tell us about the space and we will reply with the next step for ${serviceLabel.toLowerCase()}, schedule, and quote guidance.`;
  const proofBadgeLabel = linkedTestimonial
    ? linkedTestimonial.sourceLabel ?? "Client Testimonial"
    : proofReview
      ? proofReview.sourceLabel
      : undefined;

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
          <figure className="mt-8">
            <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "480px" }}>
              <ProjectImage asset={heroImage} sizes="100vw" />
            </div>
            {heroImage.caption ? (
              <figcaption className="mt-3 max-w-3xl text-sm leading-6 text-gray-mid">
                {heroImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </section>

      {/* ── 2. Summary ───────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <p className="max-w-3xl text-lg leading-8 text-charcoal/90">
          {project.flagship ? project.intro ?? project.summary : project.summary}
        </p>
        {project.flagship &&
        (project.homeownerGoal || project.designStyle || proofBadgeLabel) ? (
          <div className="mt-6 max-w-5xl rounded-xl border border-gray-200 bg-cream p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
                {serviceLabel}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
                {project.location.cityLabel}, {project.location.state}
              </span>
              {proofBadgeLabel ? (
                <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
                  {proofBadgeLabel}
                </span>
              ) : null}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {project.homeownerGoal ? (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Homeowner Goal</p>
                  <p className="mt-1 text-sm leading-6 text-charcoal/80">{project.homeownerGoal}</p>
                </div>
              ) : null}
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Service</p>
                <p className="mt-1 text-sm leading-6 text-charcoal/80">{serviceLabel}</p>
              </div>
              {project.designStyle ? (
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-gray-mid">Design Style</p>
                  <p className="mt-1 text-sm leading-6 text-charcoal/80">{project.designStyle}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
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
        {projectArea ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-mid">
            See more work in{" "}
            <TrackedLink
              href={`/areas/${projectArea.slug}`}
              eventName="proof_cta_click"
              eventParams={{
                page_type: "project",
                project_slug: project.slug,
                destination_type: "area",
                destination_slug: projectArea.slug,
                cta_location: "project_area_link",
              }}
              className="font-semibold text-red hover:underline"
            >
              {projectArea.name}
            </TrackedLink>
            {" "}if you want nearby examples before you quote the job.
          </p>
        ) : null}
      </section>

      {/* ── 3. Case study content ───────────────────────────────────── */}
      {project.flagship ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="font-ui text-xs uppercase tracking-widest text-red">Problem</p>
              <p className="mt-3 text-base leading-7 text-charcoal/80">
                {project.problem ?? project.challenge}
              </p>
            </article>
            <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="font-ui text-xs uppercase tracking-widest text-red">Approach</p>
              <p className="mt-3 text-base leading-7 text-charcoal/80">
                {project.approach ?? project.solution}
              </p>
            </article>
            <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="font-ui text-xs uppercase tracking-widest text-red">Result</p>
              <p className="mt-3 text-base leading-7 text-charcoal/80">
                {project.result ?? project.summary}
              </p>
            </article>
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <p className="font-ui text-xs uppercase tracking-widest text-red">The Challenge</p>
              <p className="mt-3 text-base leading-7 text-charcoal/80">{project.challenge}</p>
            </div>
            <div>
              <p className="font-ui text-xs uppercase tracking-widest text-red">Our Solution</p>
              <p className="mt-3 text-base leading-7 text-charcoal/80">{project.solution}</p>
            </div>
          </div>
        </section>
      )}

      {project.flagship && (project.beforeSummary || project.afterSummary) ? (
        <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {project.beforeSummary ? (
              <article className="rounded-xl border border-gray-200 bg-cream p-6">
                <p className="font-ui text-xs uppercase tracking-widest text-red">Before</p>
                <p className="mt-3 text-base leading-7 text-charcoal/80">{project.beforeSummary}</p>
              </article>
            ) : null}
            {project.afterSummary ? (
              <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-red">After</p>
                <p className="mt-3 text-base leading-7 text-charcoal/80">{project.afterSummary}</p>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── 4. Scope + Materials + Timeline ─────────────────────────── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {project.clientType ? (
            <div className="rounded-xl border border-gray-200 bg-cream p-5">
              <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Client</p>
              <p className="mt-2 text-base font-medium text-charcoal">{project.clientType}</p>
            </div>
          ) : null}
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
            <p className="mt-2 text-base font-medium text-charcoal">
              {project.timelineDetail ?? project.timeline}
            </p>
          </div>
        </div>
        {project.flagship &&
        (project.homeownerGoal || project.spaceType || project.designStyle) ? (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {project.homeownerGoal ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-red">Homeowner Goal</p>
                <p className="mt-2 text-base leading-7 text-charcoal/80">{project.homeownerGoal}</p>
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.spaceType ? (
                <div className="rounded-xl border border-gray-200 bg-cream p-5">
                  <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Space Type</p>
                  <p className="mt-2 text-base font-medium text-charcoal">{project.spaceType}</p>
                </div>
              ) : null}
              {project.designStyle ? (
                <div className="rounded-xl border border-gray-200 bg-cream p-5">
                  <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Design Style</p>
                  <p className="mt-2 text-base font-medium text-charcoal">{project.designStyle}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Materials</p>
            <p className="mt-2 text-base text-charcoal">
              {project.materialsDetail ?? project.materials}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-cream p-5">
            <p className="font-ui text-xs uppercase tracking-widest text-gray-mid">Year</p>
            <p className="mt-2 text-base font-medium text-charcoal">{project.year}</p>
          </div>
        </div>
        {project.flagship && project.installationNotes ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-widest text-red">Installation Notes</p>
            <p className="mt-2 text-base leading-7 text-charcoal/80">{project.installationNotes}</p>
          </div>
        ) : null}
        {project.scopeItems?.length ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="font-ui text-xs uppercase tracking-widest text-red">Project Scope</p>
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {project.scopeItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-charcoal">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {project.flagship && (project.fitBullets?.length || project.commonRequests?.length) ? (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {project.fitBullets?.length ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-red">Is This the Right Fit?</p>
                <ul className="mt-4 space-y-3">
                  {project.fitBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-charcoal">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {project.commonRequests?.length ? (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-red">Typical Scope Includes</p>
                <ul className="mt-4 space-y-3">
                  {project.commonRequests.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-charcoal">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
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
            pageType="project"
            showCompactCta
            ctaHref="/quote"
            ctaLabel={`Start with a ${serviceLabel} Quote`}
            eventContext="project_proof_cta"
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
                pageType="projects"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── 9. Quote CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="rounded-xl bg-red px-6 py-10 text-white md:px-10">
          <h2 className="text-3xl md:text-4xl">{projectCtaHeading}</h2>
          <p className="mt-3 max-w-2xl text-white/90">
            {projectCtaCopy}
          </p>
          <TrackedLink
            href="/quote"
            eventName="proof_cta_click"
            eventParams={{
              page_type: "project",
              project_slug: project.slug,
              cta_location: "project_quote_cta",
            }}
            className="font-ui mt-6 inline-block rounded-sm bg-white px-6 py-3 text-sm font-semibold text-red"
          >
            Start with a {serviceLabel} Quote
          </TrackedLink>
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
