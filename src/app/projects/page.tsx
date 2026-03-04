import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import { listProjects } from "@/lib/cloudinary.server";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects(500);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Projects</h1>

      {projects.length === 0 ? (
        <p style={{ color: "#555" }}>No projects found yet.</p>
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

            return (
              <article
                key={project.slug}
                style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}
              >
                <Link href={`/projects/${project.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <CloudinaryImage
                    src={cover.public_id}
                    alt={cover.context?.alt || `${project.name} project image`}
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
                    {[project.service, project.city, project.state, project.year]
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
