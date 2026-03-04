import type { Metadata } from "next";
import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { listProjects } from "@/lib/cloudinary.server";
import { buildProjectImageAlt, titleFromSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    service: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = params.service;
  const serviceLabel = titleFromSlug(service);

  return {
    title: `${serviceLabel} Projects | Sublime Design NV`,
    description: `Browse custom ${serviceLabel.toLowerCase()} projects completed by Sublime Design NV in Nevada.`,
    alternates: {
      canonical: `/services/${service}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = params.service;

  const serviceLabel = titleFromSlug(service);
  const projects = (await listProjects(1000)).filter((project) => project.service === service);

  return (
    <main style={{ padding: 40 }}>
      <LocalBusinessSchema />
      <h1>{serviceLabel}</h1>
      <p style={{ color: "#555" }}>Projects tagged as {serviceLabel.toLowerCase()}.</p>

      {projects.length === 0 ? (
        <p style={{ marginTop: 16 }}>No projects found yet.</p>
      ) : (
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
                    {[project.city, project.state, project.year].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
