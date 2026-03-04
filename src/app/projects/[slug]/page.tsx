import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CloudinaryImage from "@/components/CloudinaryImage";
import { getProjectBySlug } from "@/lib/cloudinary.server";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | Sublime Design NV",
      description: "The requested project could not be found.",
    };
  }

  const first = project.images[0];
  const title = `${project.name} | Sublime Design NV`;
  const description = project.caption || `${project.name} project gallery.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: first ? [{ url: first.secure_url }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ margin: "0 0 8px" }}>{project.name}</h1>
      {project.caption ? <p style={{ margin: "0 0 14px", color: "#555" }}>{project.caption}</p> : null}
      <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>
        {[project.service, project.city, project.state, project.year].filter(Boolean).join(" • ")}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {project.images.map((image) => (
          <div key={image.public_id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #ddd" }}>
            <CloudinaryImage
              src={image.public_id}
              alt={image.context?.alt || `${project.name} image`}
              width={1600}
              height={1000}
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ width: "100%", height: 260, objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
