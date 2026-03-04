import type { ProjectGallery } from "@/lib/cloudinary.server";
import { CITIES, MATERIALS, ROOMS } from "@/lib/facets.config";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function titleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const titleFromSlug = titleCaseFromSlug;

export function toFacetTag(prefix: string, slug: string) {
  return `${prefix}:${normalizeFacetSlug(slug)}`;
}

export function normalizeFacetSlug(value: string) {
  return slugify(value);
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

export function cityLabelFromSlug(slug: string) {
  return CITIES.find((item) => item.slug === slug)?.label || titleCaseFromSlug(slug);
}

export function materialLabelFromSlug(slug: string) {
  return MATERIALS.find((item) => item.slug === slug)?.label || titleCaseFromSlug(slug);
}

export function roomLabelFromSlug(slug: string) {
  return ROOMS.find((item) => item.slug === slug)?.label || titleCaseFromSlug(slug);
}

export function serviceLabelFromSlug(slug: string) {
  return titleCaseFromSlug(slug);
}

export function buildFacetTitle({
  cityLabel,
  serviceLabel,
  materialLabel,
  roomLabel,
}: {
  cityLabel?: string;
  serviceLabel: string;
  materialLabel?: string;
  roomLabel?: string;
}) {
  const parts = [materialLabel, roomLabel, serviceLabel].filter(Boolean).join(" ");
  if (cityLabel) {
    return `${parts} in ${cityLabel}, NV | Sublime Design NV`;
  }
  return `${parts} | Sublime Design NV`;
}

export function buildFacetDescription({
  cityLabel,
  serviceLabel,
  materialLabel,
  roomLabel,
}: {
  cityLabel?: string;
  serviceLabel: string;
  materialLabel?: string;
  roomLabel?: string;
}) {
  const parts = [materialLabel, roomLabel, serviceLabel]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (cityLabel) {
    return `Custom ${parts} projects completed in ${cityLabel}, NV by Sublime Design NV.`;
  }

  return `Browse custom ${parts} projects by Sublime Design NV.`;
}

export function buildFacetCanonical(path: string) {
  const base = "https://sublimedesignnv.com";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function pickCanonicalLabel(slug: string, options: ReadonlyArray<{ slug: string; label: string }>) {
  return options.find((option) => option.slug === slug)?.label;
}

function toCanonicalSlug(
  value: string | undefined,
  options: ReadonlyArray<{ slug: string; label: string }>,
) {
  if (!value) return undefined;
  const normalized = slugify(value);
  return options.some((option) => option.slug === normalized) ? normalized : undefined;
}

export function normalizeProjectFields(
  project: Pick<
    ProjectGallery,
    "service" | "city" | "material" | "room" | "name" | "caption" | "state" | "images"
  >,
) {
  const tags = project.images[0]?.tags ?? [];
  const taggedService = tags.find((tag) => tag.startsWith("service:"))?.split(":")[1];
  const taggedCity = tags.find((tag) => tag.startsWith("city:"))?.split(":")[1];
  const taggedMaterial = tags.find((tag) => tag.startsWith("material:"))?.split(":")[1];
  const taggedRoom = tags.find((tag) => tag.startsWith("room:"))?.split(":")[1];

  const serviceSlug = taggedService || (project.service ? slugify(project.service) : undefined);
  const citySlug = taggedCity || toCanonicalSlug(project.city, CITIES);
  const materialSlug = taggedMaterial || toCanonicalSlug(project.material, MATERIALS);
  const roomSlug = taggedRoom || toCanonicalSlug(project.room, ROOMS);

  return {
    serviceSlug,
    citySlug,
    materialSlug,
    roomSlug,
    serviceLabel: serviceSlug ? titleCaseFromSlug(serviceSlug) : undefined,
    cityLabel: citySlug ? pickCanonicalLabel(citySlug, CITIES) : project.city,
    materialLabel: materialSlug
      ? pickCanonicalLabel(materialSlug, MATERIALS)
      : project.material,
    roomLabel: roomSlug ? pickCanonicalLabel(roomSlug, ROOMS) : project.room,
    projectName: project.name,
    caption: project.caption,
    state: project.state || "NV",
  };
}

export function buildProjectMetadataTitle(project: ProjectGallery) {
  const normalized = normalizeProjectFields(project);
  const service = normalized.serviceLabel || "Custom Woodwork";
  const city = normalized.cityLabel || project.city || "Las Vegas";
  const state = normalized.state || "NV";
  return `${project.name} | ${service} in ${city} ${state}`;
}

export function buildProjectMetadataDescription(project: ProjectGallery) {
  const normalized = normalizeProjectFields(project);
  const service = (normalized.serviceLabel || "custom woodwork").toLowerCase();
  const city = normalized.cityLabel || project.city || "Las Vegas";
  const state = normalized.state || "NV";
  return `Custom ${service} project completed in ${city}, ${state} by Sublime Design NV.`;
}

export function buildProjectImageAlt(
  project: Pick<ProjectGallery, "service" | "city" | "state" | "room" | "material">,
) {
  const service = project.service ? titleCaseFromSlug(project.service).toLowerCase() : "custom woodwork";
  const city = project.city || "Las Vegas";
  const state = project.state || "NV";
  const room = project.room || "interior";
  const material = project.material || "wood";

  return `${service} project in ${city} ${state} - ${room} - ${material}`;
}
