import Image from "next/image";
import TrackedLink from "@/components/analytics/TrackedLink";
import CloudinaryImage from "@/components/CloudinaryImage";
import type { ProjectDef } from "@/content/projects";
import { getRelatedReviews } from "@/content/reviews";
import { findService } from "@/content/services";
import { findTestimonial } from "@/content/testimonials";
import { getProjectCardPreviewAsset } from "@/lib/portfolio.server";

type ProjectCardProps = {
  project: ProjectDef;
  priorityLabel?: string;
  pageType?: "home" | "projects" | "service" | "area";
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

function ProjectPreview({
  preview,
  alt,
}: {
  preview: Awaited<ReturnType<typeof getProjectCardPreviewAsset>>;
  alt: string;
}) {
  if (!preview) {
    return (
      <div className="flex h-full items-center justify-center bg-cream px-6 text-center">
        <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
          Project photos coming soon
        </p>
      </div>
    );
  }

  if (preview.source === "cloudinary" && preview.publicId) {
    return (
      <CloudinaryImage
        src={preview.publicId}
        alt={preview.alt}
        width={960}
        height={720}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        crop="pad"
        gravity="auto:subject"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  }

  return (
    <Image
      src={preview.secureUrl}
      alt={preview.alt || alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-contain p-2 transition duration-500 group-hover:scale-[1.02]"
    />
  );
}

export default async function ProjectCard({
  project,
  priorityLabel,
  pageType = "projects",
  sourceSlug,
}: ProjectCardProps) {
  const preview = await getProjectCardPreviewAsset(
    project.slug,
    project.galleryServiceSlug ?? project.serviceSlug,
  ).catch(() => null);
  const service = findService(project.serviceSlug);
  const testimonial = project.testimonialSlug
    ? findTestimonial(project.testimonialSlug)
    : undefined;
  const linkedReview = getRelatedReviews({
    projectSlug: project.slug,
    serviceSlug: project.serviceSlug,
    limit: 1,
  })[0];

  const label = priorityLabel ?? (project.flagship ? "Flagship" : undefined);

  return (
    <TrackedLink
      href={`/projects/${project.slug}`}
      eventName={project.flagship ? "proof_cta_click" : undefined}
      eventParams={
        project.flagship
          ? {
              page_type: pageType,
              project_slug: project.slug,
              cta_location: "flagship_project_card",
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
            }
          : undefined
      }
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream sm:aspect-[4/3]">
        <ProjectPreview preview={preview} alt={project.title} />
        {label ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-red shadow-sm">
            {label}
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
          {(service?.shortTitle ?? project.serviceSlug.replace(/-/g, " "))} • {project.location.cityLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-cream px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-charcoal">
            {service?.shortTitle ?? project.serviceSlug.replace(/-/g, " ")}
          </span>
          <span className="rounded-full border border-gray-200 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-gray-mid">
            {project.location.cityLabel}, {project.location.state}
          </span>
          {(linkedReview || testimonial || project.flagship) ? (
            <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
              {linkedReview ? "Client Review" : testimonial ? "Testimonial" : "Flagship"}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-xl text-charcoal group-hover:text-red">{project.title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-mid" style={clampStyle(2)}>
          {project.summary}
        </p>

        {testimonial ? (
          <p
            className="mt-4 border-l-2 border-red pl-3 text-sm italic text-gray-mid"
            style={clampStyle(2)}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        ) : linkedReview ? (
          <p
            className="mt-4 border-l-2 border-red pl-3 text-sm italic text-gray-mid"
            style={clampStyle(2)}
          >
            &ldquo;{linkedReview.quote}&rdquo;
          </p>
        ) : null}

        <span className="font-ui mt-5 inline-block text-sm font-semibold text-red">
          View Project
        </span>
      </div>
    </TrackedLink>
  );
}
