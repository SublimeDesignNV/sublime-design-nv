import type { CanonicalProject } from "@/lib/projectRecords.server";
import type { ProjectImageAsset } from "@/lib/portfolio.server";
import { getSiteUrl } from "@/lib/seo";

type Props = {
  project: CanonicalProject;
  publicTitle: string;
  publicDescription: string;
  images: ProjectImageAsset[];
};

export default function ProjectSchema({ project, publicTitle, publicDescription, images }: Props) {
  const siteUrl = getSiteUrl();
  const projectUrl = `${siteUrl}/projects/${project.slug}`;
  const businessId = `${siteUrl}/#business`;

  const locationName = project.areaLabel ?? project.location ?? "Las Vegas";
  const locationFull = `${locationName}, NV`;

  // Completion date string for dateCreated
  const completionDate =
    project.completionYear
      ? project.completionMonth
        ? `${project.completionYear}-${String(project.completionMonth).padStart(2, "0")}`
        : String(project.completionYear)
      : undefined;

  // Keywords from finishes + service + location
  const finishKeywords = project.finishes.flatMap((f) =>
    [f.name, f.code, f.supplier].filter(Boolean),
  );
  const keywords = [
    project.serviceLabel,
    locationName,
    "Las Vegas",
    "finish carpentry",
    "custom woodwork Las Vegas",
    ...finishKeywords.slice(0, 12),
  ]
    .filter(Boolean)
    .join(", ");

  // ── Service schema ─────────────────────────────────────────────────────────
  const serviceSchema = project.serviceLabel
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${project.serviceLabel} in ${locationName}, NV`,
        provider: { "@id": businessId },
        serviceType: project.serviceLabel,
        areaServed: {
          "@type": "Place",
          name: locationFull,
        },
        description: publicDescription,
      }
    : null;

  // ── ImageObject per photo ──────────────────────────────────────────────────
  const imageObjects = images
    .filter((img) => img.resourceType !== "video")
    .map((img, i) => ({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: img.secureUrl,
      url: img.secureUrl,
      name: img.alt || `${publicTitle} — Photo ${i + 1}`,
      description: [project.serviceLabel, locationName, ...finishKeywords.slice(0, 3)]
        .filter(Boolean)
        .join(", "),
      creator: {
        "@type": "Organization",
        "@id": businessId,
        name: "Sublime Design NV",
        url: siteUrl,
      },
      copyrightHolder: {
        "@type": "Organization",
        "@id": businessId,
        name: "Sublime Design NV",
        url: siteUrl,
      },
      creditText: "Sublime Design NV",
      license: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      acquireLicensePage: `${siteUrl}/contact`,
      copyrightNotice: "© Sublime Design NV. All rights reserved.",
      locationCreated: {
        "@type": "Place",
        name: locationFull,
      },
      keywords,
    }));

  // ── CreativeWork ───────────────────────────────────────────────────────────
  const creativeWork = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: publicTitle,
    url: projectUrl,
    description: publicDescription,
    creator: { "@id": businessId },
    ...(completionDate ? { dateCreated: completionDate } : {}),
    locationCreated: {
      "@type": "Place",
      name: locationFull,
    },
    keywords,
    image: images.filter((i) => i.resourceType !== "video").slice(0, 5).map((i) => i.secureUrl),
    ...(project.finishes.length > 0
      ? {
          material: project.finishes
            .map((f) => [f.name, f.code].filter(Boolean).join(" "))
            .join(", "),
        }
      : {}),
  };

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${siteUrl}/projects` },
      { "@type": "ListItem", position: 3, name: publicTitle, item: projectUrl },
    ],
  };

  const schemas = [
    ...(serviceSchema ? [serviceSchema] : []),
    ...imageObjects,
    creativeWork,
    breadcrumbs,
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
