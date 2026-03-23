import Image from "next/image";
import TrackedLink from "@/components/analytics/TrackedLink";
import SitePhoto from "@/components/SitePhoto";
import {
  getProjectExcerpt,
  getPublicProjectEyebrow,
  getPublicProjectTitle,
  getProjectQuoteHref,
  getValidatedProjectPrimaryCta,
  type CanonicalProject,
} from "@/lib/projectRecords.server";

type ProjectRecordCardProps = {
  project: CanonicalProject;
  pageType?: "home" | "projects" | "service" | "area" | "gallery";
  sourceSlug?: string;
};

function clampStyle(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

function ProjectCover({ project }: { project: CanonicalProject }) {
  const title = getPublicProjectTitle(project);
  if (project.coverPublicId) {
    return (
      <SitePhoto
        publicId={project.coverPublicId}
        alt={title}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        mode="card"
        className="transition duration-500 group-hover:scale-[1.02]"
      />
    );
  }

  if (project.coverImageUrl) {
    return <Image src={project.coverImageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-cream px-6 text-center">
      <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
        Project photos coming soon
      </p>
    </div>
  );
}

function getTrackingParams(
  project: CanonicalProject,
  pageType: ProjectRecordCardProps["pageType"],
  sourceSlug?: string,
  ctaLocation = "project_record_card",
) {
  return {
    page_type: pageType,
    project_slug: project.slug,
    cta_location: ctaLocation,
    ...(pageType === "area" && sourceSlug
      ? {
          area_slug: sourceSlug,
          destination_type: "project",
          destination_slug: project.slug,
        }
      : {}),
    ...(pageType === "service" && sourceSlug
      ? {
          service_slug: sourceSlug,
          destination_type: "project",
          destination_slug: project.slug,
        }
      : {}),
  };
}

export default function ProjectRecordCard({
  project,
  pageType = "projects",
  sourceSlug,
}: ProjectRecordCardProps) {
  const publicTitle = getPublicProjectTitle(project);
  const editorialCallout = getPublicProjectEyebrow(project);
  const customCta = getValidatedProjectPrimaryCta(project);
  const quoteHref = getProjectQuoteHref(project, {
    sourceType:
      pageType === "home"
        ? "homepage-card"
        : pageType === "gallery"
          ? "gallery-card"
          : pageType === "area"
            ? "area-card"
            : pageType === "service"
              ? "service-card"
              : "projects-card",
    sourcePath:
      pageType === "home"
        ? "/"
        : pageType === "gallery"
          ? "/gallery"
          : pageType === "area" && sourceSlug
            ? `/areas/${sourceSlug}`
            : pageType === "service" && sourceSlug
              ? `/services/${sourceSlug}`
              : "/projects",
    ctaLabel: customCta?.label ?? "Start Your Project",
  });
  const description = getProjectExcerpt(project, pageType === "home" ? 170 : 140);
  const showEditorialCallout = pageType === "home" && Boolean(editorialCallout);

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <TrackedLink
        href={`/projects/${project.slug}`}
        eventName={project.featured ? "proof_cta_click" : undefined}
        eventParams={getTrackingParams(project, pageType, sourceSlug, "project_card_image")}
        className="group block"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-cream sm:aspect-[4/3]">
          <ProjectCover project={project} />
          {project.featured ? (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-red shadow-sm">
              Featured
            </span>
          ) : null}
        </div>
      </TrackedLink>

      <div className="p-5">
        {showEditorialCallout ? (
          <p className="font-ui text-[10px] uppercase tracking-[0.18em] text-red">
            {editorialCallout}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap gap-2">
          {project.serviceLabel ? (
            <span className="rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
              {project.serviceLabel}
            </span>
          ) : null}
          {project.areaLabel ? (
            <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
              {project.areaLabel}
            </span>
          ) : null}
          {project.location ? (
            <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
              {project.location}
            </span>
          ) : null}
          {project.completionYear ? (
            <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
              {project.completionYear}
            </span>
          ) : null}
        </div>

        <TrackedLink
          href={`/projects/${project.slug}`}
          eventName={project.featured ? "proof_cta_click" : undefined}
          eventParams={getTrackingParams(project, pageType, sourceSlug, "project_card_title")}
          className="mt-3 block"
        >
          <h3 className="text-xl text-charcoal transition hover:text-red">{publicTitle}</h3>
        </TrackedLink>

        <p className="mt-2 text-sm leading-6 text-gray-mid" style={clampStyle(3)}>
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
            {project.assetCount} image{project.assetCount === 1 ? "" : "s"}
          </span>
          {project.placements.homepageSpotlight ? (
            <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
              Spotlight
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <TrackedLink
            href={`/projects/${project.slug}`}
            eventName="proof_cta_click"
            eventParams={getTrackingParams(project, pageType, sourceSlug, "project_card_view_cta")}
            className="font-ui inline-flex items-center rounded-sm bg-red px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90"
          >
            View Project
          </TrackedLink>
          <TrackedLink
            href={customCta?.href ?? quoteHref}
            eventName="proof_cta_click"
            eventParams={getTrackingParams(project, pageType, sourceSlug, "project_card_lead_cta")}
            className="font-ui inline-flex items-center rounded-sm border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:border-red hover:text-red"
          >
            {customCta?.label ?? "Start Your Project"}
          </TrackedLink>
        </div>
      </div>
    </article>
  );
}
