import type { ProjectGallery } from "@/lib/cloudinary.server";

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function citySlugToName(citySlug: string) {
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://sublimedesignnv.com";
}

export function buildProjectMetadataTitle(project: ProjectGallery) {
  const service = project.service ? titleFromSlug(project.service) : "Custom Woodwork";
  const city = project.city || "Las Vegas";
  const state = project.state || "NV";
  return `${project.name} | ${service} in ${city} ${state}`;
}

export function buildProjectMetadataDescription(project: ProjectGallery) {
  const service = project.service ? titleFromSlug(project.service).toLowerCase() : "custom woodwork";
  const city = project.city || "Las Vegas";
  const state = project.state || "NV";
  return `Custom ${service} project completed in ${city}, ${state} by Sublime Design NV.`;
}

export function buildProjectImageAlt(
  project: Pick<ProjectGallery, "service" | "city" | "state" | "room" | "material">,
) {
  const service = project.service ? titleFromSlug(project.service).toLowerCase() : "custom woodwork";
  const city = project.city || "Las Vegas";
  const state = project.state || "NV";
  const room = project.room || "interior";
  const material = project.material || "wood";

  return `${service} project in ${city} ${state} - ${room} - ${material}`;
}
