import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import ProjectsFilterBar from "@/components/projects/ProjectsFilterBar";
import { listProjectsWithFacets } from "@/lib/cloudinary.server";

export const dynamic = "force-dynamic";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

function readParam(params: SearchParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = {
    service: readParam(searchParams, "service"),
    city: readParam(searchParams, "city"),
    material: readParam(searchParams, "material"),
    featured: readParam(searchParams, "featured") === "true" ? "true" : undefined,
    year: readParam(searchParams, "year"),
  } as const;

  const { projects, facets, total } = await listProjectsWithFacets({
    ...filters,
    page: 1,
    pageSize: 24,
  });

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Projects</h1>
      <p style={{ margin: "0 0 16px", color: "#555" }}>
        Showing {projects.length} of {total} projects
      </p>

      <ProjectsFilterBar facets={facets} filters={filters} />

      {projects.length === 0 ? (
        <p style={{ color: "#555" }}>No projects match the selected filters.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {projects.map((project) => {
            const cover = project.images[0];
            if (!cover) return null;

            const fallbackAlt = `${project.name} - ${project.service || "custom"} - Sublime Design NV`;

            return (
              <article
                key={project.slug}
                style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <CloudinaryImage
                    src={cover.public_id}
                    alt={cover.context?.alt || fallbackAlt}
                    width={1200}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ width: "100%", height: 240, objectFit: "cover" }}
                  />
                </Link>
                <div style={{ padding: 14 }}>
                  <h2 style={{ margin: "0 0 8px" }}>
                    <Link href={`/projects/${project.slug}`} style={{ color: "inherit" }}>
                      {project.name}
                    </Link>
                  </h2>
                  {project.caption ? (
                    <p style={{ margin: "0 0 10px", color: "#555" }}>{project.caption}</p>
                  ) : null}
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                    {[project.service, project.city, project.state, project.material, project.year]
                      .filter(Boolean)
                      .join(" • ")}
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
