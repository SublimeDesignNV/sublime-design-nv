import Image from "next/image";
import TrackedLink from "@/components/analytics/TrackedLink";
import CloudinaryImage from "@/components/CloudinaryImage";
import type { CanonicalProject } from "@/lib/projectRecords.server";

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
  if (project.coverPublicId) {
    return (
      <CloudinaryImage
        src={project.coverPublicId}
        alt={project.title}
        width={960}
        height={720}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        crop="pad"
        gravity="auto:subject"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  }

  if (project.coverImageUrl) {
    return (
      <Image
        src={project.coverImageUrl}
        alt={project.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-contain p-2 transition duration-500 group-hover:scale-[1.02]"
      />
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-cream px-6 text-center">
      <p className="font-ui text-xs uppercase tracking-[0.18em] text-gray-mid">
        Project photos coming soon
      </p>
    </div>
  );
}

export default function ProjectRecordCard({
  project,
  pageType = "projects",
  sourceSlug,
}: ProjectRecordCardProps) {
  return (
    <TrackedLink
      href={`/projects/${project.slug}`}
      eventName={project.featured ? "proof_cta_click" : undefined}
      eventParams={
        project.featured
          ? {
              page_type: pageType,
              project_slug: project.slug,
              cta_location: "project_record_card",
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
        <ProjectCover project={project} />
        {project.featured ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-red shadow-sm">
            Featured
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
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
        </div>

        <h3 className="mt-3 text-xl text-charcoal group-hover:text-red">{project.title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-mid" style={clampStyle(2)}>
          {project.description || `${project.assetCount} linked project image${project.assetCount === 1 ? "" : "s"}.`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
            {project.assetCount} image{project.assetCount === 1 ? "" : "s"}
          </span>
          {project.featured ? (
            <span className="rounded-full border border-red/20 bg-red/5 px-3 py-1 font-ui text-[10px] uppercase tracking-[0.16em] text-red">
              Homepage featured
            </span>
          ) : null}
        </div>

        <span className="font-ui mt-5 inline-block text-sm font-semibold text-red">
          View Project
        </span>
      </div>
    </TrackedLink>
  );
}
