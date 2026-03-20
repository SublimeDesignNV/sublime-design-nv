import "server-only";

import { Prisma, ProjectStatus } from "@prisma/client";
import { findArea } from "@/content/areas";
import { findService } from "@/content/services";
import { buildCanonicalAssetFields, getAssetTagBuckets } from "@/lib/assetContract";
import { db } from "@/lib/db";
import type { PortfolioTag } from "@/lib/portfolio.types";
import { buildQuoteHref, type LeadSourceType } from "@/lib/publicLeadCtas";
import { slugify } from "@/lib/seo";

export type ProjectVisibilityDiagnosis =
  | "draft_project"
  | "ready_project"
  | "unpublished_project"
  | "missing_cover_image"
  | "no_linked_assets"
  | "linked_assets_unpublished"
  | "missing_service_classification"
  | "not_featured_for_homepage"
  | "renderable_project";

export type ProjectStatusValue = "DRAFT" | "READY" | "PUBLISHED";

export type ProjectReadinessChecklist = {
  hasTitle: boolean;
  hasSlug: boolean;
  hasService: boolean;
  hasCoverImage: boolean;
  hasLinkedAssets: boolean;
  hasDescription: boolean;
  hasAreaOrLocation: boolean;
  readyForHomepageFeature: boolean;
};

export type ProjectPlacementPreview = {
  projectsIndex: boolean;
  projectPage: boolean;
  galleryPage: boolean;
  servicePage: boolean;
  areaPage: boolean;
  homepageFeatured: boolean;
  homepageSpotlight: boolean;
  homepageHeroEligible: boolean;
};

export type CanonicalProjectAsset = {
  id: string;
  position: number;
  title: string | null;
  description: string | null;
  location: string | null;
  published: boolean;
  publicId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  secureUrl: string | null;
  resourceType: "image" | "video";
  format: string | null;
  width: number | null;
  height: number | null;
  primaryServiceSlug: string | null;
  projectId: string | null;
  projectSlug: string | null;
  renderable: boolean;
  diagnosis: string;
  tags: PortfolioTag[];
  serviceTags: PortfolioTag[];
  contextTags: PortfolioTag[];
  contextSlugs: string[];
};

export type CanonicalProject = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatusValue;
  published: boolean;
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  spotlightRank: number | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  location: string | null;
  description: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  testimonialPresent: boolean;
  completionYear: number | null;
  internalNotes: string | null;
  featuredReason: string | null;
  coverAssetId: string | null;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  coverPublicId: string | null;
  assetCount: number;
  publishedAssetCount: number;
  assets: CanonicalProjectAsset[];
  createdAt: string;
  updatedAt: string;
  diagnosis: ProjectVisibilityDiagnosis;
  readiness: ProjectReadinessChecklist;
  placements: ProjectPlacementPreview;
};

export type UploadBatchSummary = {
  uploadBatchId: string;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
  linkedAssetCount: number;
  publishedAssetCount: number;
  draftAssetCount: number;
  serviceSlugs: string[];
  status: "linked" | "partial" | "unlinked";
  thumbnails: string[];
  assetIds: string[];
  projectIds: string[];
  projectSlugs: string[];
  projectTitles: string[];
};

export type RecentPublishingAction = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatusValue;
  coverImageUrl: string | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  assetCount: number;
  featured: boolean;
  homepageSpotlight: boolean;
  updatedAt: string;
  diagnosis: ProjectVisibilityDiagnosis;
};

export type ProjectPublicCta = {
  label: string;
  href: string;
};

const PROJECT_ASSET_SELECT = {
  position: true,
  asset: {
    select: {
      id: true,
      kind: true,
      publicId: true,
      secureUrl: true,
      width: true,
      height: true,
      format: true,
      title: true,
      description: true,
      location: true,
      primaryServiceSlug: true,
      published: true,
      uploadBatchId: true,
      tags: {
        include: {
          serviceType: {
            select: {
              slug: true,
              title: true,
              tagType: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ProjectAssetSelect;

export const PROJECT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  serviceSlug: true,
  areaSlug: true,
  location: true,
  status: true,
  published: true,
  featured: true,
  homepageSpotlight: true,
  heroEligible: true,
  spotlightRank: true,
  primaryCtaLabel: true,
  primaryCtaHref: true,
  testimonialPresent: true,
  completionYear: true,
  internalNotes: true,
  featuredReason: true,
  coverAssetId: true,
  createdAt: true,
  updatedAt: true,
  assets: {
    orderBy: {
      position: "asc",
    },
    select: PROJECT_ASSET_SELECT,
  },
} satisfies Prisma.ProjectSelect;

type DbProject = Prisma.ProjectGetPayload<{ select: typeof PROJECT_SELECT }>;

const ORPHAN_SELECT = {
  id: true,
  kind: true,
  publicId: true,
  secureUrl: true,
  width: true,
  height: true,
  format: true,
  title: true,
  description: true,
  location: true,
  primaryServiceSlug: true,
  published: true,
  uploadBatchId: true,
  createdAt: true,
  projectLinks: {
    select: {
      project: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
  },
  tags: {
    include: {
      serviceType: {
        select: {
          slug: true,
          title: true,
          tagType: true,
        },
      },
    },
  },
} satisfies Prisma.AssetSelect;

type DbOrphanAsset = Prisma.AssetGetPayload<{ select: typeof ORPHAN_SELECT }>;

type ProjectMutationInput = {
  title: string;
  slug?: string;
  description?: string | null;
  serviceSlug?: string | null;
  areaSlug?: string | null;
  location?: string | null;
  status?: ProjectStatus;
  published?: boolean;
  featured?: boolean;
  homepageSpotlight?: boolean;
  heroEligible?: boolean;
  spotlightRank?: number | null;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  testimonialPresent?: boolean;
  completionYear?: number | null;
  internalNotes?: string | null;
  featuredReason?: string | null;
  coverAssetId?: string | null;
  assetIds?: string[];
};

function normalizeOrderedAssetIds(assetIds: string[]) {
  return Array.from(new Set(assetIds.map((id) => id.trim()).filter(Boolean)));
}

function normalizeProjectStatus(input: {
  status?: ProjectStatus | null;
  published?: boolean;
}) {
  if (input.status) {
    return {
      status: input.status,
      published: input.status === ProjectStatus.PUBLISHED,
    };
  }

  return {
    status: input.published ? ProjectStatus.PUBLISHED : ProjectStatus.DRAFT,
    published: Boolean(input.published),
  };
}

function getProjectReadinessChecklist(input: {
  title: string;
  slug: string;
  serviceSlug: string | null;
  coverImageUrl: string | null;
  assets: CanonicalProjectAsset[];
  description: string | null;
  areaSlug: string | null;
  location: string | null;
}) {
  const renderableAssets = input.assets.filter((asset) => asset.published && asset.renderable);
  return {
    hasTitle: Boolean(input.title.trim()),
    hasSlug: Boolean(input.slug.trim()),
    hasService: Boolean(input.serviceSlug),
    hasCoverImage: Boolean(input.coverImageUrl),
    hasLinkedAssets: renderableAssets.length > 0,
    hasDescription: Boolean(input.description?.trim()),
    hasAreaOrLocation: Boolean(input.areaSlug || input.location?.trim()),
    readyForHomepageFeature:
      Boolean(input.serviceSlug) &&
      Boolean(input.coverImageUrl) &&
      renderableAssets.length > 0 &&
      Boolean(input.description?.trim()),
  } satisfies ProjectReadinessChecklist;
}

function getProjectPlacements(input: {
  status: ProjectStatusValue;
  serviceSlug: string | null;
  areaSlug: string | null;
  featured: boolean;
  homepageSpotlight: boolean;
  heroEligible: boolean;
  diagnosis: ProjectVisibilityDiagnosis;
}) {
  const renderable = input.status === "PUBLISHED" && input.diagnosis === "renderable_project";
  return {
    projectsIndex: renderable,
    projectPage: renderable,
    galleryPage: renderable,
    servicePage: renderable && Boolean(input.serviceSlug),
    areaPage: renderable && Boolean(input.areaSlug),
    homepageFeatured: renderable && input.featured,
    homepageSpotlight: renderable && input.homepageSpotlight && input.featured,
    homepageHeroEligible: renderable && input.heroEligible && input.featured,
  } satisfies ProjectPlacementPreview;
}

function getProjectDiagnosis(
  project: Pick<
    CanonicalProject,
    "status" | "serviceSlug" | "assets" | "coverImageUrl" | "featured"
  >,
  context: { homepage?: boolean } = {},
): ProjectVisibilityDiagnosis {
  if (project.status === "DRAFT") return "draft_project";
  if (project.status === "READY") return "ready_project";
  if (!project.serviceSlug) return "missing_service_classification";
  if (!project.assets.length) return "no_linked_assets";
  const renderableAssets = project.assets.filter((asset) => asset.published && asset.renderable);
  if (!renderableAssets.length) return "linked_assets_unpublished";
  if (!project.coverImageUrl) return "missing_cover_image";
  if (context.homepage && !project.featured) return "not_featured_for_homepage";
  return "renderable_project";
}

export function getProjectExcerpt(
  project: Pick<CanonicalProject, "description" | "assetCount">,
  maxLength = 160,
) {
  const source =
    project.description?.trim() ||
    `${project.assetCount} linked project image${project.assetCount === 1 ? "" : "s"}.`;
  if (source.length <= maxLength) return source;
  return `${source.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getProjectQuoteHref(
  project: Pick<CanonicalProject, "serviceSlug" | "areaSlug" | "slug" | "title" | "location">,
  context: { sourceType: LeadSourceType; sourcePath?: string; ctaLabel?: string },
) {
  return buildQuoteHref({
    sourceType: context.sourceType,
    sourcePath: context.sourcePath,
    projectTitle: project.title,
    projectSlug: project.slug,
    serviceSlug: project.serviceSlug,
    areaSlug: project.areaSlug,
    location: project.location,
    ctaLabel: context.ctaLabel,
  });
}

export function getValidatedProjectPrimaryCta(
  project: Pick<CanonicalProject, "primaryCtaLabel" | "primaryCtaHref">,
): ProjectPublicCta | null {
  const label = project.primaryCtaLabel?.trim();
  const href = project.primaryCtaHref?.trim();
  if (!label || !href) return null;
  if (!(href.startsWith("/") && !href.startsWith("//")) && !href.startsWith("#")) {
    return null;
  }

  return { label, href };
}

function mapProjectAsset(project: DbProject, entry: DbProject["assets"][number]): CanonicalProjectAsset {
  const asset = entry.asset;
  const tags = asset.tags.map((tag) => ({
    slug: tag.serviceType.slug,
    title: tag.serviceType.title,
    tagType: tag.serviceType.tagType,
  }));
  const { serviceTags, contextTags, contextSlugs } = getAssetTagBuckets(tags);
  const canonical = buildCanonicalAssetFields({
    kind: asset.kind,
    publicId: asset.publicId,
    secureUrl: asset.secureUrl,
    format: asset.format,
    width: asset.width,
    height: asset.height,
    published: asset.published,
    projectId: project.id,
    projectSlug: project.slug,
    projectTitle: project.title,
  });

  return {
    id: asset.id,
    position: entry.position,
    title: asset.title,
    description: asset.description,
    location: asset.location,
    published: asset.published,
    publicId: canonical.publicId,
    imageUrl: canonical.imageUrl,
    thumbnailUrl: canonical.thumbnailUrl,
    secureUrl: canonical.imageUrl,
    resourceType: canonical.resourceType,
    format: canonical.format,
    width: canonical.width,
    height: canonical.height,
    primaryServiceSlug: asset.primaryServiceSlug,
    projectId: canonical.projectId,
    projectSlug: canonical.projectSlug,
    renderable: canonical.renderable,
    diagnosis: canonical.diagnosis,
    tags,
    serviceTags,
    contextTags,
    contextSlugs,
  };
}

function mapProject(project: DbProject): CanonicalProject {
  const assets = project.assets.map((entry) => mapProjectAsset(project, entry));
  const renderableAssets = assets.filter((asset) => asset.published && asset.renderable);
  const coverAsset =
    renderableAssets.find((asset) => asset.id === project.coverAssetId) ??
    renderableAssets[0] ??
    null;
  const status = project.status as ProjectStatusValue;

  const base = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    status,
    published: project.published,
    featured: project.featured,
    homepageSpotlight: project.homepageSpotlight,
    heroEligible: project.heroEligible,
    spotlightRank: project.spotlightRank,
    serviceSlug: project.serviceSlug,
    serviceLabel: project.serviceSlug ? (findService(project.serviceSlug)?.shortTitle ?? null) : null,
    areaSlug: project.areaSlug,
    areaLabel: project.areaSlug ? (findArea(project.areaSlug)?.name ?? null) : null,
    location: project.location,
    description: project.description,
    primaryCtaLabel: project.primaryCtaLabel,
    primaryCtaHref: project.primaryCtaHref,
    testimonialPresent: project.testimonialPresent,
    completionYear: project.completionYear,
    internalNotes: project.internalNotes,
    featuredReason: project.featuredReason,
    coverAssetId: coverAsset?.id ?? project.coverAssetId ?? null,
    coverImageUrl: coverAsset?.imageUrl ?? null,
    coverThumbnailUrl: coverAsset?.thumbnailUrl ?? null,
    coverPublicId: coverAsset?.publicId ?? null,
    assetCount: assets.length,
    publishedAssetCount: renderableAssets.length,
    assets,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };

  const checklist = getProjectReadinessChecklist({
    title: base.title,
    slug: base.slug,
    serviceSlug: base.serviceSlug,
    coverImageUrl: base.coverImageUrl,
    assets,
    description: base.description,
    areaSlug: base.areaSlug,
    location: base.location,
  });
  const diagnosis = getProjectDiagnosis({
    status: base.status,
    serviceSlug: base.serviceSlug,
    assets,
    coverImageUrl: base.coverImageUrl,
    featured: base.featured,
  });

  return {
    ...base,
    diagnosis,
    readiness: checklist,
    placements: getProjectPlacements({
      status: base.status,
      serviceSlug: base.serviceSlug,
      areaSlug: base.areaSlug,
      featured: base.featured,
      homepageSpotlight: base.homepageSpotlight,
      heroEligible: base.heroEligible,
      diagnosis,
    }),
  };
}

async function ensureValidLinkedAssets(
  tx: Prisma.TransactionClient,
  assetIds: string[],
  coverAssetId?: string | null,
) {
  const normalizedAssetIds = normalizeOrderedAssetIds(assetIds);
  if (!normalizedAssetIds.length) {
    throw new Error("ASSET_IDS_REQUIRED");
  }

  const assets = await tx.asset.findMany({
    where: { id: { in: normalizedAssetIds } },
    select: { id: true },
  });

  if (assets.length !== normalizedAssetIds.length) {
    throw new Error("INVALID_ASSET_IDS");
  }

  if (coverAssetId && !normalizedAssetIds.includes(coverAssetId)) {
    throw new Error("INVALID_COVER_ASSET");
  }

  return normalizedAssetIds;
}

function buildBaseSlug(title: string, requestedSlug?: string) {
  const candidate = slugify(requestedSlug?.trim() || title.trim());
  return candidate || null;
}

async function ensureUniqueProjectSlug(
  tx: Prisma.TransactionClient,
  baseSlug: string,
  excludeProjectId?: string,
  manualRequested = false,
) {
  const existing = await tx.project.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeProjectId ? { NOT: { id: excludeProjectId } } : {}),
    },
    select: { id: true },
  });

  if (!existing) return baseSlug;
  if (manualRequested) throw new Error("SLUG_TAKEN");

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${baseSlug}-${suffix}`;
    const collision = await tx.project.findFirst({
      where: {
        slug: candidate,
        ...(excludeProjectId ? { NOT: { id: excludeProjectId } } : {}),
      },
      select: { id: true },
    });
    if (!collision) return candidate;
  }

  throw new Error("SLUG_TAKEN");
}

function normalizeCreateUpdateData(input: ProjectMutationInput) {
  const title = input.title.trim();
  if (!title) throw new Error("TITLE_REQUIRED");

  const baseSlug = buildBaseSlug(title, input.slug);
  if (!baseSlug) throw new Error("INVALID_SLUG");

  const state = normalizeProjectStatus({
    status: input.status ?? undefined,
    published: input.published,
  });

  return {
    title,
    baseSlug,
    manualRequested: Boolean(input.slug?.trim()),
    data: {
      description: input.description?.trim() || null,
      serviceSlug: input.serviceSlug?.trim() || null,
      areaSlug: input.areaSlug?.trim() || null,
      location: input.location?.trim() || null,
      status: state.status,
      published: state.published,
      featured: Boolean(input.featured),
      homepageSpotlight: Boolean(input.homepageSpotlight),
      heroEligible: Boolean(input.heroEligible),
      spotlightRank: input.spotlightRank ?? null,
      primaryCtaLabel: input.primaryCtaLabel?.trim() || null,
      primaryCtaHref: input.primaryCtaHref?.trim() || null,
      testimonialPresent: Boolean(input.testimonialPresent),
      completionYear: input.completionYear ?? null,
      internalNotes: input.internalNotes?.trim() || null,
      featuredReason: input.featuredReason?.trim() || null,
    },
  };
}

export async function createProjectRecord(input: ProjectMutationInput) {
  const normalized = normalizeCreateUpdateData(input);
  const assetIds = normalizeOrderedAssetIds(input.assetIds ?? []);

  return db.$transaction(async (tx) => {
    const normalizedAssetIds = await ensureValidLinkedAssets(tx, assetIds, input.coverAssetId);
    const slug = await ensureUniqueProjectSlug(
      tx,
      normalized.baseSlug,
      undefined,
      normalized.manualRequested,
    );

    const project = await tx.project.create({
      data: {
        title: normalized.title,
        slug,
        ...normalized.data,
        coverAssetId: input.coverAssetId ?? normalizedAssetIds[0] ?? null,
        assets: {
          create: normalizedAssetIds.map((assetId, index) => ({
            assetId,
            position: index,
          })),
        },
      },
      select: PROJECT_SELECT,
    });

    return mapProject(project);
  });
}

export async function updateProjectRecord(id: string, input: ProjectMutationInput) {
  const normalized = normalizeCreateUpdateData(input);
  const assetIds = normalizeOrderedAssetIds(input.assetIds ?? []);

  return db.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new Error("PROJECT_NOT_FOUND");

    const normalizedAssetIds = await ensureValidLinkedAssets(tx, assetIds, input.coverAssetId);
    const slug = await ensureUniqueProjectSlug(
      tx,
      normalized.baseSlug,
      id,
      normalized.manualRequested,
    );

    const project = await tx.project.update({
      where: { id },
      data: {
        title: normalized.title,
        slug,
        ...normalized.data,
        coverAssetId: input.coverAssetId ?? normalizedAssetIds[0] ?? null,
        assets: {
          deleteMany: {},
          create: normalizedAssetIds.map((assetId, index) => ({
            assetId,
            position: index,
          })),
        },
      },
      select: PROJECT_SELECT,
    });

    return mapProject(project);
  });
}

export async function listAdminProjects(): Promise<CanonicalProject[]> {
  if (!process.env.DATABASE_URL) return [];

  const projects = await db.project.findMany({
    select: PROJECT_SELECT,
    orderBy: [{ updatedAt: "desc" }],
  });

  return projects.map(mapProject);
}

export async function listProjectOptions() {
  const projects = await listAdminProjects();
  return projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    status: project.status,
    published: project.published,
    assetCount: project.assetCount,
  }));
}

export async function getProjectRecordBySlug(slug: string): Promise<CanonicalProject | null> {
  if (!process.env.DATABASE_URL) return null;

  const project = await db.project.findUnique({
    where: { slug },
    select: PROJECT_SELECT,
  });

  return project ? mapProject(project) : null;
}

export async function getProjectRecordById(id: string): Promise<CanonicalProject | null> {
  if (!process.env.DATABASE_URL) return null;

  const project = await db.project.findUnique({
    where: { id },
    select: PROJECT_SELECT,
  });

  return project ? mapProject(project) : null;
}

type PublicProjectFilter = {
  serviceSlug?: string;
  areaSlug?: string;
  featuredOnly?: boolean;
  limit?: number;
};

function sortProjectsForPublic(projects: CanonicalProject[]) {
  return [...projects].sort((a, b) => {
    if (a.homepageSpotlight !== b.homepageSpotlight) return a.homepageSpotlight ? -1 : 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if ((a.spotlightRank ?? Number.MAX_SAFE_INTEGER) !== (b.spotlightRank ?? Number.MAX_SAFE_INTEGER)) {
      return (a.spotlightRank ?? Number.MAX_SAFE_INTEGER) - (b.spotlightRank ?? Number.MAX_SAFE_INTEGER);
    }
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export async function listPublicProjects(filter: PublicProjectFilter = {}): Promise<CanonicalProject[]> {
  const projects = await listAdminProjects();
  const filtered = projects.filter((project) => {
    if (project.status !== "PUBLISHED") return false;
    if (project.diagnosis !== "renderable_project") return false;
    if (filter.serviceSlug && project.serviceSlug !== filter.serviceSlug) return false;
    if (filter.areaSlug && project.areaSlug !== filter.areaSlug) return false;
    if (filter.featuredOnly && !project.featured) return false;
    return true;
  });

  const ordered = sortProjectsForPublic(filtered);
  return typeof filter.limit === "number" ? ordered.slice(0, filter.limit) : ordered;
}

export async function getHomepageSpotlightProjects(limit = 3): Promise<CanonicalProject[]> {
  const spotlight = await listPublicProjects({ featuredOnly: true });
  const explicit = spotlight.filter((project) => project.homepageSpotlight);
  if (explicit.length) return explicit.slice(0, limit);

  const featured = spotlight;
  if (featured.length) return featured.slice(0, limit);

  const fallback = await listPublicProjects();
  return fallback
    .filter((project) => project.readiness.readyForHomepageFeature)
    .slice(0, limit)
    .map((project) => ({
      ...project,
      diagnosis: getProjectDiagnosis(project, { homepage: true }),
    }));
}

export async function getHomepageFeaturedProjects(
  limit = 6,
  options?: { excludeSlugs?: string[] },
): Promise<CanonicalProject[]> {
  const excludeSlugs = new Set(options?.excludeSlugs ?? []);
  const featured = (await listPublicProjects({ featuredOnly: true })).filter(
    (project) => !excludeSlugs.has(project.slug),
  );
  if (featured.length) return featured.slice(0, limit);

  return (await listPublicProjects())
    .filter((project) => !excludeSlugs.has(project.slug))
    .slice(0, limit)
    .map((project) => ({
      ...project,
      diagnosis: getProjectDiagnosis(project, { homepage: true }),
    }));
}

function mapOrphanAsset(asset: DbOrphanAsset) {
  const tags = asset.tags.map((tag) => ({
    slug: tag.serviceType.slug,
    title: tag.serviceType.title,
    tagType: tag.serviceType.tagType,
  }));
  const { serviceTags, contextTags, contextSlugs } = getAssetTagBuckets(tags);
  const canonical = buildCanonicalAssetFields({
    kind: asset.kind,
    publicId: asset.publicId,
    secureUrl: asset.secureUrl,
    format: asset.format,
    width: asset.width,
    height: asset.height,
    published: asset.published,
  });

  return {
    id: asset.id,
    title: asset.title,
    description: asset.description,
    location: asset.location,
    primaryServiceSlug: asset.primaryServiceSlug,
    publicId: canonical.publicId,
    imageUrl: canonical.imageUrl,
    thumbnailUrl: canonical.thumbnailUrl,
    renderable: canonical.renderable,
    diagnosis: canonical.renderable ? "unlinked_to_project" : canonical.diagnosis,
    createdAt: asset.createdAt.toISOString(),
    uploadBatchId: asset.uploadBatchId,
    published: asset.published,
    projectLinks: asset.projectLinks.map((link) => link.project),
    serviceTags,
    contextTags,
    contextSlugs,
  };
}

export async function listRenderableOrphanAssets(options?: {
  uploadedSince?: Date;
  linked?: boolean;
  published?: boolean;
  requiresBatch?: boolean;
}) {
  if (!process.env.DATABASE_URL) return [];

  const assets = await db.asset.findMany({
    where: {
      ...(typeof options?.published === "boolean" ? { published: options.published } : {}),
      ...(options?.uploadedSince ? { createdAt: { gte: options.uploadedSince } } : {}),
      ...(typeof options?.linked === "boolean"
        ? options.linked
          ? { projectLinks: { some: {} } }
          : { projectLinks: { none: {} } }
        : { projectLinks: { none: {} } }),
      ...(options?.requiresBatch ? { NOT: { uploadBatchId: null } } : {}),
    },
    select: ORPHAN_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return assets.map(mapOrphanAsset).filter((asset) => asset.renderable);
}

export async function listUploadBatchSummaries(options?: {
  uploadedSince?: Date;
  linkedOnly?: boolean;
  unlinkedOnly?: boolean;
  publishedOnly?: boolean;
  draftOnly?: boolean;
  batchId?: string;
}) {
  if (!process.env.DATABASE_URL) return [];

  const assets = await db.asset.findMany({
    where: {
      NOT: { uploadBatchId: null },
      ...(options?.batchId ? { uploadBatchId: options.batchId } : {}),
      ...(options?.uploadedSince ? { createdAt: { gte: options.uploadedSince } } : {}),
      ...(options?.publishedOnly ? { published: true } : {}),
      ...(options?.draftOnly ? { published: false } : {}),
    },
    select: ORPHAN_SELECT,
    orderBy: [{ createdAt: "desc" }],
  });

  const grouped = new Map<string, DbOrphanAsset[]>();
  for (const asset of assets) {
    const batchId = asset.uploadBatchId;
    if (!batchId) continue;
    const current = grouped.get(batchId) ?? [];
    current.push(asset);
    grouped.set(batchId, current);
  }

  const summaries = Array.from(grouped.entries()).map(([uploadBatchId, batchAssets]) => {
    const mapped = batchAssets.map(mapOrphanAsset);
    const linkedAssetCount = mapped.filter((asset) => asset.projectLinks.length > 0).length;
    const publishedAssetCount = mapped.filter((asset) => asset.published).length;
    const draftAssetCount = mapped.length - publishedAssetCount;
    const projectMap = new Map<string, { slug: string; title: string }>();
    for (const asset of mapped) {
      for (const link of asset.projectLinks) {
        projectMap.set(link.id, { slug: link.slug, title: link.title });
      }
    }
    const status =
      linkedAssetCount === 0 ? "unlinked" : linkedAssetCount === mapped.length ? "linked" : "partial";

    return {
      uploadBatchId,
      assetCount: mapped.length,
      createdAt: mapped[mapped.length - 1]?.createdAt ?? mapped[0]?.createdAt ?? new Date().toISOString(),
      updatedAt: mapped[0]?.createdAt ?? new Date().toISOString(),
      linkedAssetCount,
      publishedAssetCount,
      draftAssetCount,
      serviceSlugs: Array.from(new Set(mapped.map((asset) => asset.primaryServiceSlug).filter(Boolean))) as string[],
      status,
      thumbnails: mapped.map((asset) => asset.thumbnailUrl || asset.imageUrl || "").filter(Boolean).slice(0, 4),
      assetIds: mapped.map((asset) => asset.id),
      projectIds: Array.from(projectMap.keys()),
      projectSlugs: Array.from(projectMap.values()).map((project) => project.slug),
      projectTitles: Array.from(projectMap.values()).map((project) => project.title),
    } satisfies UploadBatchSummary;
  });

  return summaries.filter((summary) => {
    if (options?.linkedOnly && summary.linkedAssetCount === 0) return false;
    if (options?.unlinkedOnly && summary.linkedAssetCount > 0) return false;
    return true;
  });
}

export async function getProjectVisibilityDebug(id: string) {
  const project = await getProjectRecordById(id);
  if (!project) return null;

  return {
    project,
    readiness: project.readiness,
    placements: project.placements,
    homepageFallbackReason:
      project.placements.homepageSpotlight || project.placements.homepageFeatured
        ? "explicit_featured_project"
        : project.status !== "PUBLISHED"
          ? "not_published"
          : !project.readiness.readyForHomepageFeature
            ? "not_ready_for_homepage_feature"
            : "eligible_fallback_candidate",
  };
}

export async function listRecentPublishingActions(limit = 8): Promise<RecentPublishingAction[]> {
  const projects = await listAdminProjects();
  return projects.slice(0, limit).map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    status: project.status,
    coverImageUrl: project.coverThumbnailUrl ?? project.coverImageUrl,
    serviceSlug: project.serviceSlug,
    serviceLabel: project.serviceLabel,
    areaSlug: project.areaSlug,
    areaLabel: project.areaLabel,
    assetCount: project.assetCount,
    featured: project.featured,
    homepageSpotlight: project.homepageSpotlight,
    updatedAt: project.updatedAt,
    diagnosis: project.diagnosis,
  }));
}

export async function backfillProjectRecords(options?: { autoCreateDrafts?: boolean }) {
  const orphanAssets = await listRenderableOrphanAssets();
  const projects = await listAdminProjects();
  const updates = {
    totalOrphanedAssets: orphanAssets.length,
    totalLinkedToExistingProjects: 0,
    totalNewProjectsCreated: 0,
    totalProjectCoversRepaired: 0,
    unresolvedItems: [] as Array<{ type: string; id: string; reason: string }>,
  };

  for (const project of projects) {
    if (!project.coverAssetId && project.assets[0]) {
      await db.project.update({
        where: { id: project.id },
        data: {
          coverAssetId: project.assets[0].id,
        },
      });
      updates.totalProjectCoversRepaired += 1;
    }
  }

  if (options?.autoCreateDrafts) {
    const grouped = new Map<string, typeof orphanAssets>();
    for (const asset of orphanAssets) {
      const key = asset.uploadBatchId || asset.id;
      const current = grouped.get(key) ?? [];
      current.push(asset);
      grouped.set(key, current);
    }

    for (const group of Array.from(grouped.values())) {
      const lead = group[0];
      try {
        await createProjectRecord({
          title: lead.title || `${lead.primaryServiceSlug ?? "project"} project`,
          serviceSlug: lead.primaryServiceSlug,
          location: lead.location || null,
          status: ProjectStatus.DRAFT,
          featured: false,
          homepageSpotlight: false,
          heroEligible: false,
          assetIds: group.map((asset) => asset.id),
          coverAssetId: lead.id,
        });
        updates.totalNewProjectsCreated += 1;
      } catch (error) {
        updates.unresolvedItems.push({
          type: "orphan_asset_group",
          id: lead.id,
          reason: error instanceof Error ? error.message : "unknown_error",
        });
      }
    }
  }

  return updates;
}
