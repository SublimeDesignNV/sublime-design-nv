import { findProject, type ProjectDef } from "@/content/projects";
import { findService } from "@/content/services";

function isUsefulAlt(value?: string | null) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return !["image", "photo", "picture", "project image", "project photo"].includes(normalized);
}

function serviceLabel(serviceSlug: string) {
  return findService(serviceSlug)?.shortTitle ?? serviceSlug.replace(/-/g, " ");
}

export function getServiceImageAlt({
  serviceSlug,
  explicitAlt,
}: {
  serviceSlug: string;
  explicitAlt?: string | null;
}) {
  if (isUsefulAlt(explicitAlt)) {
    return explicitAlt!.trim();
  }

  return `${serviceLabel(serviceSlug)} installation by Sublime Design NV in Las Vegas Valley`;
}

export function getProjectImageAlt({
  project,
  explicitAlt,
  index = 0,
  variant = "gallery",
}: {
  project: ProjectDef;
  explicitAlt?: string | null;
  index?: number;
  variant?: "hero" | "gallery" | "card";
}) {
  if (isUsefulAlt(explicitAlt)) {
    return explicitAlt!.trim();
  }

  if (variant === "hero" && isUsefulAlt(project.heroAlt)) {
    return project.heroAlt!.trim();
  }

  if (variant !== "hero" && isUsefulAlt(project.galleryAltPrefix)) {
    return `${project.galleryAltPrefix!.trim()} ${index + 1}`;
  }

  const service = serviceLabel(project.serviceSlug);
  const location = `${project.location.cityLabel}, ${project.location.state}`;

  if (variant === "hero" || variant === "card") {
    return `${project.title} ${service} project in ${location}`;
  }

  return `${project.title} detail ${index + 1} for ${service.toLowerCase()} in ${location}`;
}

export function getProjectImageAltBySlug({
  projectSlug,
  serviceSlug,
  explicitAlt,
  index = 0,
  variant = "gallery",
}: {
  projectSlug: string;
  serviceSlug: string;
  explicitAlt?: string | null;
  index?: number;
  variant?: "hero" | "gallery" | "card";
}) {
  const project = findProject(projectSlug);

  if (project) {
    return getProjectImageAlt({
      project,
      explicitAlt,
      index,
      variant,
    });
  }

  return getServiceImageAlt({
    serviceSlug,
    explicitAlt,
  });
}
