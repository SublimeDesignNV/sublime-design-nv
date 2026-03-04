import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { ROOMS } from "@/lib/facets.config";
import { SERVICES } from "@/lib/services.config";
import {
  buildFacetCanonical,
  buildFacetDescription,
  buildFacetTitle,
  buildProjectImageAlt,
  titleCaseFromSlug,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    service: string;
    room: string;
  };
};

function resolveLabels(service: string, room: string) {
  const serviceOk = SERVICES.includes(service as (typeof SERVICES)[number]);
  const roomItem = ROOMS.find((item) => item.slug === room);
  if (!serviceOk || !roomItem) return null;

  return {
    serviceLabel: titleCaseFromSlug(service),
    roomLabel: roomItem.label,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const labels = resolveLabels(params.service, params.room);
  if (!labels) {
    return {
      title: "Not Found | Sublime Design NV",
      description: "Facet page not found.",
    };
  }

  const path = `/services/${params.service}/room/${params.room}`;
  return {
    title: buildFacetTitle(labels),
    description: buildFacetDescription(labels),
    alternates: {
      canonical: buildFacetCanonical(path),
    },
  };
}

export default async function ServiceRoomPage({ params }: Props) {
  const labels = resolveLabels(params.service, params.room);
  if (!labels) notFound();

  const projects = (await listProjectsIndex(400)).filter(
    (project) => project.serviceSlug === params.service && project.roomSlug === params.room,
  );

  if (!projects.length) {
    notFound();
  }

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <h1>{`${labels.roomLabel} ${labels.serviceLabel}`}</h1>
      <p style={{ color: "#555" }}>{buildFacetDescription(labels)}</p>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {projects.map((project) => (
          <article key={project.slug} style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            {project.heroPublicId ? (
              <Link href={`/projects/${project.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                <CloudinaryImage
                  src={project.heroPublicId}
                  alt={
                    project.heroAlt ||
                    buildProjectImageAlt({
                      service: project.serviceSlug,
                      city: project.cityLabel,
                      state: project.state,
                      room: project.roomLabel,
                      material: project.materialLabel,
                    })
                  }
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              </Link>
            ) : null}
            <div style={{ padding: 12 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>
                <Link href={`/projects/${project.slug}`} style={{ color: "inherit" }}>
                  {project.name}
                </Link>
              </h2>
              <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
                {[project.cityLabel, project.state, project.materialLabel, project.year]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
