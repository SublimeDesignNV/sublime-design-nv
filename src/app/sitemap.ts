import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/cloudinary.server";
import { SERVICES } from "@/lib/services.config";
import { slugify } from "@/lib/seo";

export const revalidate = 3600;

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://sublime-design-nv.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const projects = await listProjects(1000).catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/gallery`, lastModified: now },
    { url: `${siteUrl}/projects`, lastModified: now },
    { url: `${siteUrl}/services`, lastModified: now },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${siteUrl}/services/${service}`,
    lastModified: now,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.images[0]?.created_at
      ? new Date(project.images[0].created_at)
      : now,
  }));

  const locationRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(
      projects
        .filter((project) => project.city && project.service)
        .map((project) => `/${slugify(project.city as string)}-${project.service as string}`),
    ),
  ).map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...locationRoutes];
}
