import type { ProjectGallery } from "@/lib/cloudinary.server";
import { getSiteUrl } from "@/lib/seo";

type Props = {
  project: ProjectGallery;
};

export default function ProjectSchema({ project }: Props) {
  const siteUrl = getSiteUrl();
  const projectUrl = `${siteUrl}/projects/${project.slug}`;
  const description = project.caption || `${project.name} project by Sublime Design NV.`;

  const imageObjects = project.images.map((image) => ({
    "@type": "ImageObject",
    contentUrl: image.secure_url,
    url: image.secure_url,
    width: image.width,
    height: image.height,
    caption: image.context?.alt || project.name,
  }));

  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description,
    image: project.images.map((image) => image.secure_url),
    associatedMedia: imageObjects,
    locationCreated: {
      "@type": "Place",
      name: [project.city, project.state].filter(Boolean).join(", "),
    },
    url: projectUrl,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${siteUrl}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: projectUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWork) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
