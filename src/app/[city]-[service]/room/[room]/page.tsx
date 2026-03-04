import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import FacetBreadcrumbs from "@/components/seo/FacetBreadcrumbs";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import RelatedFacetLinks from "@/components/seo/RelatedFacetLinks";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { CITIES, MATERIALS, ROOMS } from "@/lib/facets.config";
import { SERVICES } from "@/lib/services.config";
import {
  buildFacetCanonical,
  buildFacetDescription,
  buildFacetTitle,
  buildProjectImageAlt,
  materialLabelFromSlug,
  serviceLabelFromSlug,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    city: string;
    service: string;
    room: string;
  };
};

function resolveLabels(city: string, service: string, room: string) {
  const cityItem = CITIES.find((item) => item.slug === city);
  const serviceOk = SERVICES.includes(service as (typeof SERVICES)[number]);
  const roomItem = ROOMS.find((item) => item.slug === room);

  if (!cityItem || !serviceOk || !roomItem) return null;

  return {
    cityLabel: cityItem.label,
    serviceLabel: serviceLabelFromSlug(service),
    roomLabel: roomItem.label,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const labels = resolveLabels(params.city, params.service, params.room);
  if (!labels) {
    return {
      title: "Not Found | Sublime Design NV",
      description: "Facet page not found.",
    };
  }

  const path = `/${params.city}-${params.service}/room/${params.room}`;
  return {
    title: buildFacetTitle(labels),
    description: buildFacetDescription(labels),
    alternates: {
      canonical: buildFacetCanonical(path),
    },
  };
}

export default async function CityServiceRoomPage({ params }: Props) {
  const labels = resolveLabels(params.city, params.service, params.room);
  if (!labels) notFound();

  const allProjects = await listProjectsIndex(500);
  const cityServiceProjects = allProjects.filter(
    (project) => project.citySlug === params.city && project.serviceSlug === params.service,
  );
  const projects = cityServiceProjects.filter(
    (project) => project.roomSlug === params.room,
  );

  if (!projects.length) {
    notFound();
  }

  const otherRoomLinks = ROOMS.filter((room) => room.slug !== params.room)
    .map((room) => {
      const matches = cityServiceProjects.filter((project) => project.roomSlug === room.slug).length;
      return {
        label: `${room.label} (${matches})`,
        href: `/${params.city}-${params.service}/room/${room.slug}`,
        matches,
      };
    })
    .filter((item) => item.matches > 0)
    .map(({ label, href }) => ({ label, href }));

  const materialLinks = MATERIALS.map((material) => {
    const matches = projects.filter((project) => project.materialSlug === material.slug).length;
    return {
      label: `${material.label} (${matches})`,
      href: `/${params.city}-${params.service}/material/${material.slug}`,
      matches,
    };
  })
    .filter((item) => item.matches > 0)
    .map(({ label, href }) => ({ label, href }));

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <FacetBreadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: `${labels.cityLabel} ${labels.serviceLabel}`, href: `/${params.city}-${params.service}` },
          { label: labels.roomLabel, href: `/${params.city}-${params.service}/room/${params.room}` },
        ]}
      />

      <h1>{`${labels.roomLabel} ${labels.serviceLabel} in ${labels.cityLabel}, NV`}</h1>
      <p style={{ color: "#555" }}>{buildFacetDescription(labels)}</p>

      <RelatedFacetLinks title={`Other Rooms in ${labels.cityLabel}`} links={otherRoomLinks} />
      <RelatedFacetLinks title={`Materials in ${labels.cityLabel}`} links={materialLinks} />

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
                {[materialLabelFromSlug(project.materialSlug || ""), project.roomLabel, project.year]
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
