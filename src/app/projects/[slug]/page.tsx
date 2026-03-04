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

function getFallbackDescription(project: {
  name: string;
  service?: string;
  city?: string;
  state?: string;
  material?: string;
  year?: string;
}) {
  const details = [project.service, project.city, project.state, project.material, project.year]
    .filter(Boolean)
    .join(" • ");

  if (!details) {
    return `${project.name} project gallery by Sublime Design NV.`;
  }

  return `${project.name} project gallery featuring ${details}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    return {
      title: "Project Not Found | Sublime Design NV",
      description: "The requested project could not be found.",
      alternates: {
        canonical: `/projects/${params.slug}`,
      },
    };
  }

  const first = project.images[0];
  const title = `${project.name} | Sublime Design NV`;
  const description = project.caption || getFallbackDescription(project);

  return {
    title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/projects/${project.slug}`,
      images: first ? [{ url: first.secure_url, alt: first.context?.alt || project.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: first ? [first.secure_url] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const description = project.caption || getFallbackDescription(project);
  const imageUrls = project.images.map((image) => image.secure_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description,
    image: imageUrls,
    creator: {
      "@type": "Organization",
      name: "Sublime Design NV",
    },
    brand: {
      "@type": "Brand",
      name: "Sublime Design NV",
    },
    areaServed: "NV",
  };

  return (
    <main style={{ padding: 40 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 style={{ margin: "0 0 8px" }}>{project.name}</h1>
      <p style={{ margin: "0 0 14px", color: "#555" }}>{description}</p>
      <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>
        {[project.service, project.city, project.state, project.material, project.year]
          .filter(Boolean)
          .join(" • ")}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
        }}
      >
        {project.images.map((image) => {
          const fallbackAlt = `${project.name} - ${project.service || "custom"} - Sublime Design NV`;

          return (
            <div
              key={image.public_id}
              style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #ddd" }}
            >
              <CloudinaryImage
                src={image.public_id}
                alt={image.context?.alt || fallbackAlt}
                width={1600}
                height={1000}
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ width: "100%", height: 260, objectFit: "cover" }}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
