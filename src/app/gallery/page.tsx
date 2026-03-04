import Link from "next/link";
import CloudinaryImage from "@/components/CloudinaryImage";
import { listProjects } from "@/lib/cloudinary.server";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const projects = await listProjects(500);

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Gallery</h1>

      {projects.length === 0 ? (
        <p style={{ color: "#555" }}>No projects found yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {projects.map((project) => {
            const cover = project.images[0];
            if (!cover) return null;

            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                  background: "#fff",
                }}
              >
                <CloudinaryImage
                  src={cover.public_id}
                  alt={cover.context?.alt || `${project.name} cover image`}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
                <div style={{ padding: 14 }}>
                  <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{project.name}</h2>
                  <p style={{ margin: "0 0 6px", color: "#555", fontSize: 14 }}>
                    {project.images.length} image{project.images.length === 1 ? "" : "s"}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
                    {[project.service, project.city, project.state, project.year]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
