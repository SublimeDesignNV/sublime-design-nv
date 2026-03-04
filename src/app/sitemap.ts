import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/cloudinary.server";

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
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.images[0]?.created_at
      ? new Date(project.images[0].created_at)
      : now,
  }));

  return [...staticRoutes, ...projectRoutes];
}
