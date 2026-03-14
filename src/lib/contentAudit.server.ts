import "server-only";

import { ACTIVE_AREAS, getAreaProjects, getAreaServices, getDirectAreaReviews, type AreaDef } from "@/content/areas";
import { SERVICE_LIST, ACTIVE_SERVICES } from "@/content/services";
import { FLAGSHIP_PROJECTS, FEATURED_PROJECTS, PROJECT_LIST, type ProjectDef } from "@/content/projects";
import { getRelatedReviews, getReviewsByService } from "@/content/reviews";
import { findTestimonial, getTestimonialsByService } from "@/content/testimonials";
import { listAssetsByServiceTag } from "@/lib/cloudinary.server";
import {
  getContentCompletion,
  getContentCoverageStatus,
  getFlagshipProjectTarget,
  getContentTarget,
  type ContentCoverageStatus,
} from "@/lib/contentTargets";
import { getRepoImageCount } from "@/lib/portfolioContent.server";
import { getProjectCardPreviewAsset, getProjectImages } from "@/lib/portfolio.server";
import { BUSINESS_PROFILE } from "@/lib/reviews.config";
import { getSeedImageCount } from "@/lib/seedImages.server";

export type ReadinessStatus = "thin" | "improving" | "launch-ready";

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
  usingSeedFallback: boolean;
  linkedProjectCount: number;
  linkedReviewCount: number;
  linkedAreaCoverageCount: number;
  hasEnoughProofDensity: boolean;
  readinessScore: number;
  readinessMaxScore: number;
  readinessStatus: ReadinessStatus;
  promotionReady: boolean;
  shouldNoindex: boolean;
  missingHeroImage: boolean;
  missingGalleryDepth: boolean;
  suggestedNextAction: string;
  notes: string[];
};

export type ProjectContentAuditRow = {
  slug: string;
  title: string;
  serviceSlug: string;
  location: string;
  isFlagship: boolean;
  imageCount: number;
  targetImageCount: number;
  hasHeroImage: boolean;
  heroSource: "cloudinary" | "seed" | "missing";
  usingSeedFallback: boolean;
  hasGalleryDepth: boolean;
  hasService: boolean;
  hasLocation: boolean;
  hasSummary: boolean;
  hasReviewOrTestimonial: boolean;
  hasRichFlagshipProof: boolean;
  hasShareReadyMetadataInputs: boolean;
  hasGoogleReviewCta: boolean;
  readinessScore: number;
  readinessMaxScore: number;
  readinessStatus: ReadinessStatus;
  promotionReady: boolean;
  shouldNoindex: boolean;
};

export type AreaContentAuditRow = {
  slug: string;
  name: string;
  linkedProjectCount: number;
  hasFlagshipProject: boolean;
  linkedReviewCount: number;
  relatedServiceCount: number;
  hasIntroCopy: boolean;
  hasSeoMetadata: boolean;
  readinessScore: number;
  readinessMaxScore: number;
  readinessStatus: ReadinessStatus;
  promotionReady: boolean;
  shouldNoindex: boolean;
};

export type LaunchReadinessSummary = {
  activeServices: number;
  totalProjects: number;
  flagshipProjects: number;
  featuredProjects: number;
  flagshipOrFeaturedProjects: number;
  activeAreas: number;
  servicesWithContent: number;
  servicesWithHeroCandidate: number;
  healthyServices: number;
  promotionReadyServices: number;
  promotionReadyProjects: number;
  promotionReadyAreas: number;
  thresholds: {
    hasSixActiveServices: boolean;
    hasSixProjects: boolean;
    hasThreeFlagshipOrFeaturedProjects: boolean;
    hasOneHeroCandidate: boolean;
  };
};

export type FlagshipProjectAuditRow = {
  slug: string;
  title: string;
  serviceSlug: string;
  location: string;
  imageCount: number;
  cloudinaryImageCount: number;
  seedImageCount: number;
  targetImageCount: number;
  galleryStatus: ContentCoverageStatus;
  hasHeroImage: boolean;
  heroSource: "cloudinary" | "seed" | "missing";
  heroFromCloudinary: boolean;
  usingSeedFallback: boolean;
  hasLinkedReview: boolean;
  hasReviewOrTestimonial: boolean;
  hasLocation: boolean;
  hasProjectSummary: boolean;
  hasRichContent: boolean;
  hasStrongCtaLine: boolean;
  hasBeforeAfterContent: boolean;
  hasRealWorldContent: boolean;
  hasShareReadyMetadataInputs: boolean;
  hasOgReadyMetadata: boolean;
  missingHeroImage: boolean;
  missingGalleryDepth: boolean;
  suggestedNextAction: string;
};

export type PromotionReadySummary = {
  services: ServiceContentAuditRow[];
  projects: ProjectContentAuditRow[];
  areas: AreaContentAuditRow[];
};

export type PromotionReadyItem = {
  title: string;
  href: string;
  readinessStatus: ReadinessStatus;
  whyReady: string;
  note: string;
};

export type PromotionReadyPanel = {
  flagshipProjects: PromotionReadyItem[];
  services: PromotionReadyItem[];
  areas: PromotionReadyItem[];
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

function getReadinessStatus(score: number, maxScore: number): ReadinessStatus {
  if (maxScore <= 0) return "thin";
  const ratio = score / maxScore;
  if (ratio >= 0.8) return "launch-ready";
  if (ratio >= 0.5) return "improving";
  return "thin";
}

function getProjectTargetImageCount(project: ProjectDef) {
  return project.flagship ? getFlagshipProjectTarget(project.slug) : 4;
}

function getServiceSuggestedAction({
  hasHeroCandidate,
  actualImageCount,
  targetImageCount,
  usingSeedFallback,
}: {
  hasHeroCandidate: boolean;
  actualImageCount: number;
  targetImageCount: number;
  usingSeedFallback: boolean;
}) {
  if (!hasHeroCandidate) return "Upload hero image";
  if (usingSeedFallback) return "Replace seed fallback with real project photos";
  if (actualImageCount < targetImageCount) {
    return `Upload ${targetImageCount - actualImageCount} more gallery images`;
  }
  return "Coverage looks healthy";
}

function getFlagshipSuggestedAction({
  hasHeroImage,
  imageCount,
  targetImageCount,
  usingSeedFallback,
}: {
  hasHeroImage: boolean;
  imageCount: number;
  targetImageCount: number;
  usingSeedFallback: boolean;
}) {
  if (!hasHeroImage) return "Upload hero image";
  if (usingSeedFallback) return "Replace seed fallback with real project photos";
  if (imageCount < targetImageCount) {
    return `Upload ${targetImageCount - imageCount} more gallery images`;
  }
  return "Coverage looks healthy";
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
      const linkedProjectCount = PROJECT_LIST.filter(
        (project) => project.serviceSlug === service.slug,
      ).length;
      const linkedReviewCount =
        getReviewsByService(service.slug).length + getTestimonialsByService(service.slug).length;
      const linkedAreaCoverageCount = ACTIVE_AREAS.filter((area) =>
        area.relatedServiceSlugs.includes(service.slug),
      ).length;
      const usingSeedFallback = cloudinaryCount === 0 && seedCount > 0;
      const readinessChecks = [
        actualImageCount > 0,
        hasHeroCandidate,
        hasFeaturedImage,
        linkedProjectCount > 0,
        linkedReviewCount > 0,
        linkedAreaCoverageCount >= 3,
        !usingSeedFallback || cloudinaryCount >= 3,
      ];
      const readinessScore = readinessChecks.filter(Boolean).length;
      const readinessMaxScore = readinessChecks.length;
      const readinessStatus = getReadinessStatus(readinessScore, readinessMaxScore);
      const hasEnoughProofDensity =
        linkedProjectCount > 0 &&
        linkedReviewCount > 0 &&
        actualImageCount >= Math.min(targetImageCount, 4);
      const promotionReady =
        readinessStatus === "launch-ready" &&
        !usingSeedFallback &&
        hasEnoughProofDensity;
      const missingHeroImage = !hasHeroCandidate;
      const missingGalleryDepth = actualImageCount < targetImageCount;
      const notes: string[] = [];

      if (!hasHeroCandidate) notes.push("No hero candidate");
      if (!hasFeaturedImage) notes.push("No featured image");
      if (usingSeedFallback) notes.push("Seed fallback still active");
      if (linkedProjectCount === 0) notes.push("No linked projects");
      if (linkedReviewCount === 0) notes.push("No linked proof");

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
        usingSeedFallback,
        linkedProjectCount,
        linkedReviewCount,
        linkedAreaCoverageCount,
        hasEnoughProofDensity,
        readinessScore,
        readinessMaxScore,
        readinessStatus,
        promotionReady,
        shouldNoindex:
          readinessStatus === "thin" &&
          actualImageCount <= 1 &&
          linkedProjectCount === 0 &&
          linkedReviewCount === 0,
        missingHeroImage,
        missingGalleryDepth,
        suggestedNextAction: getServiceSuggestedAction({
          hasHeroCandidate,
          actualImageCount,
          targetImageCount,
          usingSeedFallback,
        }),
        notes,
      } satisfies ServiceContentAuditRow;
    }),
  );
}

export async function getProjectContentAuditRows(): Promise<ProjectContentAuditRow[]> {
  const hasGoogleReviewCta = Boolean(BUSINESS_PROFILE.reviewProfileUrl);

  return Promise.all(
    PROJECT_LIST.map(async (project) => {
      const preview = await getProjectCardPreviewAsset(
        project.slug,
        project.galleryServiceSlug ?? project.serviceSlug,
      ).catch(() => null);
      const images = await getProjectImages(
        project.slug,
        project.galleryServiceSlug ?? project.serviceSlug,
      ).catch(() => []);
      const review = getRelatedReviews({
        projectSlug: project.slug,
        serviceSlug: project.serviceSlug,
        limit: 1,
      })[0];
      const testimonial = project.testimonialSlug
        ? findTestimonial(project.testimonialSlug)
        : undefined;
      const targetImageCount = getProjectTargetImageCount(project);
      const imageCount = images.length;
      const hasRichFlagshipProof = project.flagship
        ? hasRichProjectContent(project) && hasRealWorldProjectContent(project)
        : true;
      const readinessChecks = [
        Boolean(preview),
        imageCount >= 4,
        Boolean(project.serviceSlug),
        Boolean(project.location.cityLabel && project.location.state),
        Boolean(project.summary),
        Boolean(review || testimonial),
        hasRichFlagshipProof,
        projectHasShareReadyMetadataInputs(project, Boolean(preview)),
        hasGoogleReviewCta,
      ];
      const readinessScore = readinessChecks.filter(Boolean).length;
      const readinessMaxScore = readinessChecks.length;
      const readinessStatus = getReadinessStatus(readinessScore, readinessMaxScore);
      const usingSeedFallback = images.length > 0 && images.some((image) => image.source === "seed");

      return {
        slug: project.slug,
        title: project.title,
        serviceSlug: project.serviceSlug,
        location: `${project.location.cityLabel}, ${project.location.state}`,
        isFlagship: Boolean(project.flagship),
        imageCount,
        targetImageCount,
        hasHeroImage: Boolean(preview),
        heroSource: preview?.source ?? "missing",
        usingSeedFallback,
        hasGalleryDepth: imageCount >= 4,
        hasService: Boolean(project.serviceSlug),
        hasLocation: Boolean(project.location.cityLabel && project.location.state),
        hasSummary: Boolean(project.summary),
        hasReviewOrTestimonial: Boolean(review || testimonial),
        hasRichFlagshipProof,
        hasShareReadyMetadataInputs: projectHasShareReadyMetadataInputs(project, Boolean(preview)),
        hasGoogleReviewCta,
        readinessScore,
        readinessMaxScore,
        readinessStatus,
        promotionReady:
          readinessStatus === "launch-ready" &&
          !usingSeedFallback &&
          Boolean(review || testimonial),
        shouldNoindex:
          readinessStatus === "thin" &&
          imageCount < 2 &&
          !Boolean(review || testimonial),
      } satisfies ProjectContentAuditRow;
    }),
  );
}

function areaHasSeoMetadata(area: AreaDef) {
  return Boolean(area.seoTitle && area.seoDescription && area.intro && area.heroHeadline && area.heroBody);
}

export async function getAreaContentAuditRows(): Promise<AreaContentAuditRow[]> {
  return ACTIVE_AREAS.map((area) => {
    const linkedProjects = getAreaProjects(area.slug);
    const directReviews = getDirectAreaReviews(area.slug);
    const relatedServices = getAreaServices(area.slug);
    const hasFlagshipProject = linkedProjects.some((project) => project.flagship);
    const readinessChecks = [
      linkedProjects.length > 0,
      hasFlagshipProject || linkedProjects.length >= 2,
      directReviews.length > 0,
      relatedServices.length >= 3,
      Boolean(area.intro),
      areaHasSeoMetadata(area),
    ];
    const readinessScore = readinessChecks.filter(Boolean).length;
    const readinessMaxScore = readinessChecks.length;
    const readinessStatus = getReadinessStatus(readinessScore, readinessMaxScore);

    return {
      slug: area.slug,
      name: area.name,
      linkedProjectCount: linkedProjects.length,
      hasFlagshipProject,
      linkedReviewCount: directReviews.length,
      relatedServiceCount: relatedServices.length,
      hasIntroCopy: Boolean(area.intro),
      hasSeoMetadata: areaHasSeoMetadata(area),
      readinessScore,
      readinessMaxScore,
      readinessStatus,
      promotionReady:
        readinessStatus === "launch-ready" &&
        linkedProjects.length > 0 &&
        directReviews.length > 0,
      shouldNoindex: linkedProjects.length === 0 && directReviews.length === 0,
    } satisfies AreaContentAuditRow;
  });
}

export async function getProjectContentAuditRowBySlug(slug: string) {
  const rows = await getProjectContentAuditRows();
  return rows.find((row) => row.slug === slug);
}

export async function getServiceContentAuditRowBySlug(slug: string) {
  const rows = await getServiceContentAuditRows();
  return rows.find((row) => row.slug === slug);
}

export async function getAreaContentAuditRowBySlug(slug: string) {
  const rows = await getAreaContentAuditRows();
  return rows.find((row) => row.slug === slug);
}

export async function getLaunchReadinessSummary(): Promise<LaunchReadinessSummary> {
  const [serviceRows, projectRows, areaRows] = await Promise.all([
    getServiceContentAuditRows(),
    getProjectContentAuditRows(),
    getAreaContentAuditRows(),
  ]);
  const flagshipOrFeaturedProjects = new Set(
    [...FLAGSHIP_PROJECTS, ...FEATURED_PROJECTS].map((project) => project.slug),
  ).size;

  return {
    activeServices: ACTIVE_SERVICES.length,
    totalProjects: PROJECT_LIST.length,
    flagshipProjects: FLAGSHIP_PROJECTS.length,
    featuredProjects: FEATURED_PROJECTS.length,
    flagshipOrFeaturedProjects,
    activeAreas: ACTIVE_AREAS.length,
    servicesWithContent: serviceRows.filter((row) => row.actualImageCount > 0).length,
    servicesWithHeroCandidate: serviceRows.filter((row) => row.hasHeroCandidate).length,
    healthyServices: serviceRows.filter((row) => row.coverageStatus === "healthy").length,
    promotionReadyServices: serviceRows.filter((row) => row.promotionReady).length,
    promotionReadyProjects: projectRows.filter((row) => row.promotionReady).length,
    promotionReadyAreas: areaRows.filter((row) => row.promotionReady).length,
    thresholds: {
      hasSixActiveServices: ACTIVE_SERVICES.length >= 6,
      hasSixProjects: PROJECT_LIST.length >= 6,
      hasThreeFlagshipOrFeaturedProjects: flagshipOrFeaturedProjects >= 3,
      hasOneHeroCandidate: serviceRows.some((row) => row.hasHeroCandidate),
    },
  };
}

function hasRichProjectContent(project: ProjectDef) {
  return Boolean(project.intro && project.problem && project.approach && project.result);
}

function hasRealWorldProjectContent(project: ProjectDef) {
  return Boolean(
    project.beforeSummary &&
      project.afterSummary &&
      project.homeownerGoal &&
      project.spaceType &&
      project.designStyle,
  );
}

function projectHasShareReadyMetadataInputs(project: ProjectDef, hasHeroImage: boolean) {
  return Boolean(
    project.seoTitle &&
      project.seoDescription &&
      (project.heroAlt || project.galleryAltPrefix || hasHeroImage),
  );
}

export async function getFlagshipProjectAuditRows(): Promise<FlagshipProjectAuditRow[]> {
  return Promise.all(
    FLAGSHIP_PROJECTS.map(async (project) => {
      const preview = await getProjectCardPreviewAsset(
        project.slug,
        project.galleryServiceSlug ?? project.serviceSlug,
      ).catch(() => null);
      const images = await getProjectImages(
        project.slug,
        project.galleryServiceSlug ?? project.serviceSlug,
      ).catch(() => []);
      const review = getRelatedReviews({
        projectSlug: project.slug,
        serviceSlug: project.serviceSlug,
        limit: 1,
      })[0];
      const testimonial = project.testimonialSlug
        ? findTestimonial(project.testimonialSlug)
        : undefined;
      const hasHeroImage = Boolean(preview);
      const targetImageCount = getFlagshipProjectTarget(project.slug);
      const imageCount = images.length;
      const cloudinaryImageCount = images.filter((image) => image.source === "cloudinary").length;
      const seedImageCount = images.filter((image) => image.source === "seed").length;
      const galleryStatus = getContentCoverageStatus(imageCount, targetImageCount);
      const shareReadyMetadataInputs = projectHasShareReadyMetadataInputs(project, hasHeroImage);
      const missingHeroImage = !hasHeroImage;
      const missingGalleryDepth = imageCount < targetImageCount;

      return {
        slug: project.slug,
        title: project.title,
        serviceSlug: project.serviceSlug,
        location: `${project.location.cityLabel}, ${project.location.state}`,
        imageCount,
        cloudinaryImageCount,
        seedImageCount,
        targetImageCount,
        galleryStatus,
        hasHeroImage,
        heroSource: preview?.source ?? "missing",
        heroFromCloudinary: preview?.source === "cloudinary",
        usingSeedFallback: images.length > 0 && images.some((image) => image.source === "seed"),
        hasLinkedReview: Boolean(review),
        hasReviewOrTestimonial: Boolean(review || testimonial),
        hasLocation: Boolean(project.location.cityLabel && project.location.state),
        hasProjectSummary: Boolean(project.summary),
        hasRichContent: hasRichProjectContent(project),
        hasStrongCtaLine: Boolean(project.ctaLine),
        hasBeforeAfterContent: Boolean(project.beforeSummary && project.afterSummary),
        hasRealWorldContent: hasRealWorldProjectContent(project),
        hasShareReadyMetadataInputs: shareReadyMetadataInputs,
        hasOgReadyMetadata: Boolean(project.seoTitle && project.seoDescription && hasHeroImage),
        missingHeroImage,
        missingGalleryDepth,
        suggestedNextAction: getFlagshipSuggestedAction({
          hasHeroImage,
          imageCount,
          targetImageCount,
          usingSeedFallback: images.length > 0 && images.some((image) => image.source === "seed"),
        }),
      };
    }),
  );
}

export async function getPromotionReadySummary(): Promise<PromotionReadySummary> {
  const [services, projects, areas] = await Promise.all([
    getServiceContentAuditRows(),
    getProjectContentAuditRows(),
    getAreaContentAuditRows(),
  ]);

  return {
    services: services.filter((row) => row.promotionReady),
    projects: projects.filter((row) => row.promotionReady && row.isFlagship),
    areas: areas.filter((row) => row.promotionReady),
  };
}

export async function getPromotionReadyPanel(): Promise<PromotionReadyPanel> {
  const summary = await getPromotionReadySummary();

  return {
    flagshipProjects: summary.projects.map((row) => ({
      title: row.title,
      href: `/projects/${row.slug}`,
      readinessStatus: row.readinessStatus,
      whyReady: "Enough real media, proof, and share-ready metadata.",
      note: "Good for Google Business post",
    })),
    services: summary.services.map((row) => ({
      title: row.title,
      href: `/services/${row.slug}`,
      readinessStatus: row.readinessStatus,
      whyReady: "Service proof density is strong enough for local search traffic.",
      note: "Ready for direct ad/test traffic",
    })),
    areas: summary.areas.map((row) => ({
      title: row.name,
      href: `/areas/${row.slug}`,
      readinessStatus: row.readinessStatus,
      whyReady: "Area page has local projects, proof, and supporting service coverage.",
      note: "Ready for social share",
    })),
  };
}
