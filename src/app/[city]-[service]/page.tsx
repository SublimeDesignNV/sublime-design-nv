import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { listProjectsIndex } from "@/lib/cloudinary.server";
import { CITIES, MATERIALS, ROOMS } from "@/lib/facets.config";
import { SERVICES } from "@/lib/services.config";
import {
  buildFacetCanonical,
  buildProjectImageAlt,
  titleCaseFromSlug,
} from "@/lib/seo";

type Props = {
  params: {
    city: string;
    service: string;
  };
};

export const dynamic = "force-dynamic";

function getCityLabel(slug: string) {
  return CITIES.find((city) => city.slug === slug)?.label;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params?.city || !params?.service) return {};
  const cityLabel = getCityLabel(params.city) || titleCaseFromSlug(params.city);
  const serviceLabel = titleCaseFromSlug(params.service);

  return {
    title: `${serviceLabel} in ${cityLabel}, NV | Sublime Design NV`,
    description: `Custom ${params.service} project completed in ${cityLabel}, NV by Sublime Design NV.`,
    alternates: {
      canonical: buildFacetCanonical(`/${params.city}-${params.service}`),
    },
  };
}

export default async function CityServicePage({ params }: Props) {
  if (!params?.city || !params?.service) notFound();
  const city = params.city;
  const service = params.service;

  if (!CITIES.some((item) => item.slug === city)) {
    notFound();
  }

  if (!SERVICES.includes(service as (typeof SERVICES)[number])) {
    notFound();
  }

  const projects = (await listProjectsIndex(500)).filter((project) => {
    return project.serviceSlug === service && project.citySlug === city;
  });

  if (projects.length === 0) {
    notFound();
  }

  const serviceLabel = titleCaseFromSlug(service);
  const cityLabel = getCityLabel(city) || titleCaseFromSlug(city);

  const materialCounts = MATERIALS.map((material) => ({
    ...material,
    count: projects.filter((project) => project.materialSlug === material.slug).length,
  })).filter((item) => item.count > 0);

  const roomCounts = ROOMS.map((room) => ({
    ...room,
    count: projects.filter((project) => project.roomSlug === room.slug).length,
  })).filter((item) => item.count > 0);

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <h1>
        {serviceLabel} in {cityLabel}
      </h1>
      <p style={{ color: "#555" }}>
        Portfolio projects for {serviceLabel.toLowerCase()} in {cityLabel}, NV.
      </p>

      {materialCounts.length > 0 ? (
        <section style={{ marginTop: 18 }}>
          <h2 style={{ marginBottom: 8 }}>Browse by Material</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {materialCounts.map((item) => (
              <Link
                key={item.slug}
                href={`/${city}-${service}/material/${item.slug}`}
                style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px" }}
              >
                {item.label} ({item.count})
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {roomCounts.length > 0 ? (
        <section style={{ marginTop: 14 }}>
          <h2 style={{ marginBottom: 8 }}>Browse by Room</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {roomCounts.map((item) => (
              <Link
                key={item.slug}
                href={`/${city}-${service}/room/${item.slug}`}
                style={{ border: "1px solid #ddd", borderRadius: 999, padding: "6px 10px" }}
              >
                {item.label} ({item.count})
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {projects.map((project) => (
          <article
            key={project.slug}
            style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}
          >
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
                {[project.materialLabel, project.roomLabel, project.style, project.year]
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
