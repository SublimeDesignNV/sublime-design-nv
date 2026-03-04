import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { listProjects } from "@/lib/cloudinary.server";
import { buildProjectImageAlt, citySlugToName, titleFromSlug } from "@/lib/seo";

type Props = {
  params: {
    city: string;
    service: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = citySlugToName(params.city);
  const serviceLabel = titleFromSlug(params.service);

  return {
    title: `${serviceLabel} in ${city} NV | Sublime Design NV`,
    description: `Custom ${params.service} project completed in ${city}, NV by Sublime Design NV.`,
    alternates: {
      canonical: `/${params.city}-${params.service}`,
    },
  };
}

export default async function CityServicePage({ params }: Props) {
  const cityName = citySlugToName(params.city).toLowerCase();
  const service = params.service;

  const projects = (await listProjects(1000)).filter((project) => {
    return project.service === service && (project.city || "").toLowerCase() === cityName;
  });

  if (projects.length === 0) {
    notFound();
  }

  const serviceLabel = titleFromSlug(service);
  const cityLabel = citySlugToName(params.city);

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <h1>
        {serviceLabel} in {cityLabel}
      </h1>
      <p style={{ color: "#555" }}>
        Portfolio projects for {serviceLabel.toLowerCase()} in {cityLabel}, NV.
      </p>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {projects.map((project) => {
          const cover = project.images[0];
          if (!cover) return null;

          return (
            <article
              key={project.slug}
              style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}
            >
              <Link href={`/projects/${project.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                <CloudinaryImage
                  src={cover.public_id}
                  alt={cover.context?.alt || buildProjectImageAlt(project)}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              </Link>
              <div style={{ padding: 12 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>
                  <Link href={`/projects/${project.slug}`} style={{ color: "inherit" }}>
                    {project.name}
                  </Link>
                </h2>
                <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
                  {[project.material, project.room, project.style, project.year]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
