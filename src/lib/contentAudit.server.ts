import "server-only";

import { SERVICE_LIST, ACTIVE_SERVICES } from "@/content/services";
import { FLAGSHIP_PROJECTS, FEATURED_PROJECTS, PROJECT_LIST } from "@/content/projects";
import { listAssetsByServiceTag } from "@/lib/cloudinary.server";
import {
  getContentCompletion,
  getContentCoverageStatus,
  getContentTarget,
  type ContentCoverageStatus,
} from "@/lib/contentTargets";
import { getRepoImageCount } from "@/lib/portfolioContent.server";
import { getSeedImageCount } from "@/lib/seedImages.server";

export type ServiceContentAuditRow = {
  slug: string;
  title: string;
  status: string;
  repoCount: number;
  cloudinaryCount: number;
  seedCount: number;
  targetImageCount: number;
  actualImageCount: number;
  completionPercentage: number;
  coverageStatus: ContentCoverageStatus;
  hasFeaturedImage: boolean;
  hasHeroCandidate: boolean;
  notes: string[];
};

export type LaunchReadinessSummary = {
  activeServices: number;
  totalProjects: number;
  flagshipProjects: number;
  featuredProjects: number;
  flagshipOrFeaturedProjects: number;
  servicesWithContent: number;
  servicesWithHeroCandidate: number;
  healthyServices: number;
  thresholds: {
    hasSixActiveServices: boolean;
    hasSixProjects: boolean;
    hasThreeFlagshipOrFeaturedProjects: boolean;
    hasOneHeroCandidate: boolean;
  };
};

function isFeaturedAsset(asset: {
  tags?: string[];
  context?: { featured?: string };
}) {
  if (asset.tags?.some((tag) => tag.toLowerCase() === "featured")) return true;
  return asset.context?.featured?.toLowerCase() === "true";
}

function hasHeroTag(asset: { tags?: string[] }) {
  return asset.tags?.some((tag) => tag.toLowerCase() === "hero") ?? false;
}

export async function getServiceContentAuditRows(): Promise<ServiceContentAuditRow[]> {
  return Promise.all(
    SERVICE_LIST.map(async (service) => {
      const repoCount = getRepoImageCount(service.slug);
      const seedCount = getSeedImageCount(service.slug);
      const cloudinaryAssets = await listAssetsByServiceTag(service.slug, 50).catch(() => []);
      const cloudinaryCount = cloudinaryAssets.length;
      const targetImageCount = getContentTarget(service.slug);
      const actualImageCount =
        cloudinaryCount > 0 ? cloudinaryCount : seedCount > 0 ? seedCount : 0;
      const completionPercentage = getContentCompletion(
        actualImageCount,
        targetImageCount,
      );
      const coverageStatus = getContentCoverageStatus(
        actualImageCount,
        targetImageCount,
      );
      const hasFeaturedImage = cloudinaryAssets.some((asset) => isFeaturedAsset(asset));
      const hasHeroCandidate =
        cloudinaryAssets.some((asset) => hasHeroTag(asset)) ||
        hasFeaturedImage ||
        cloudinaryCount > 0 ||
        seedCount > 0;
      const notes: string[] = [];

      if (!hasHeroCandidate) notes.push("No hero candidate");
      if (!hasFeaturedImage) notes.push("No featured image");

      return {
        slug: service.slug,
        title: service.shortTitle,
        status: service.status,
        repoCount,
        cloudinaryCount,
        seedCount,
        targetImageCount,
        actualImageCount,
        completionPercentage,
        coverageStatus,
        hasFeaturedImage,
        hasHeroCandidate,
        notes,
      } satisfies ServiceContentAuditRow;
    }),
  );
}

export async function getLaunchReadinessSummary(): Promise<LaunchReadinessSummary> {
  const rows = await getServiceContentAuditRows();
  const flagshipOrFeaturedProjects = new Set(
    [...FLAGSHIP_PROJECTS, ...FEATURED_PROJECTS].map((project) => project.slug),
  ).size;

  return {
    activeServices: ACTIVE_SERVICES.length,
    totalProjects: PROJECT_LIST.length,
    flagshipProjects: FLAGSHIP_PROJECTS.length,
    featuredProjects: FEATURED_PROJECTS.length,
    flagshipOrFeaturedProjects,
    servicesWithContent: rows.filter((row) => row.actualImageCount > 0).length,
    servicesWithHeroCandidate: rows.filter((row) => row.hasHeroCandidate).length,
    healthyServices: rows.filter((row) => row.coverageStatus === "healthy").length,
    thresholds: {
      hasSixActiveServices: ACTIVE_SERVICES.length >= 6,
      hasSixProjects: PROJECT_LIST.length >= 6,
      hasThreeFlagshipOrFeaturedProjects: flagshipOrFeaturedProjects >= 3,
      hasOneHeroCandidate: rows.some((row) => row.hasHeroCandidate),
    },
  };
}
