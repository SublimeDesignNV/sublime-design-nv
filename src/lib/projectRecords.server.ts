import "server-only";

import { Prisma } from "@prisma/client";
import { findArea } from "@/content/areas";
import { findService } from "@/content/services";
import { buildCanonicalAssetFields, getAssetTagBuckets } from "@/lib/assetContract";
import { db } from "@/lib/db";
import type { PortfolioTag } from "@/lib/portfolio.types";
import { slugify } from "@/lib/seo";

export type ProjectVisibilityDiagnosis =
  | "unpublished_project"
  | "missing_cover_image"
  | "no_linked_assets"
  | "linked_assets_unpublished"
  | "missing_service_classification"
  | "not_featured_for_homepage"
  | "renderable_project";

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
  published: boolean;
  featured: boolean;
  spotlightRank: number | null;
  serviceSlug: string | null;
  serviceLabel: string | null;
  areaSlug: string | null;
  areaLabel: string | null;
  location: string | null;
  description: string | null;
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
  published: true,
  featured: true,
  spotlightRank: true,
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

function getProjectDiagnosis(
  project: Pick<CanonicalProject, "published" | "featured" | "serviceSlug" | "assets" | "coverImageUrl">,
  context: { homepage?: boolean } = {},
): ProjectVisibilityDiagnosis {
  if (!project.published) return "unpublished_project";
  if (!project.serviceSlug) return "missing_service_classification";
  if (!project.assets.length) return "no_linked_assets";

  const renderableAssets = project.assets.filter((asset) => asset.published && asset.renderable);
  if (!renderableAssets.length) return "linked_assets_unpublished";
  if (!project.coverImageUrl) return "missing_cover_image";
  if (context.homepage && !project.featured) return "not_featured_for_homepage";
  return "renderable_project";
}

function mapProject(project: DbProject): CanonicalProject {
  const assets = project.assets.map((entry) => mapProjectAsset(project, entry));
  const renderableAssets = assets.filter((asset) => asset.published && asset.renderable);
  const coverAsset =
    renderableAssets.find((asset) => asset.id === project.coverAssetId) ??
    renderableAssets[0] ??
    null;

  const mapped: CanonicalProject = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    published: project.published,
    featured: project.featured,
    spotlightRank: project.spotlightRank,
    serviceSlug: project.serviceSlug,
    serviceLabel: project.serviceSlug ? (findService(project.serviceSlug)?.shortTitle ?? null) : null,
    areaSlug: project.areaSlug,
    areaLabel: project.areaSlug ? (findArea(project.areaSlug)?.name ?? null) : null,
    location: project.location,
    description: project.description,
    coverAssetId: coverAsset?.id ?? project.coverAssetId ?? null,
    coverImageUrl: coverAsset?.imageUrl ?? null,
    coverThumbnailUrl: coverAsset?.thumbnailUrl ?? null,
    coverPublicId: coverAsset?.publicId ?? null,
    assetCount: assets.length,
    publishedAssetCount: renderableAssets.length,
    assets,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    diagnosis: "renderable_project",
  };

  return {
    ...mapped,
    diagnosis: getProjectDiagnosis(mapped),
  };
}

type ProjectMutationInput = {
  title: string;
  slug?: string;
  description?: string | null;
  serviceSlug?: string | null;
  areaSlug?: string | null;
  location?: string | null;
  published?: boolean;
  featured?: boolean;
  spotlightRank?: number | null;
  coverAssetId?: string | null;
  assetIds?: string[];
};

function normalizeOrderedAssetIds(assetIds: string[]) {
  return Array.from(new Set(assetIds.map((id) => id.trim()).filter(Boolean)));
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

function buildProjectSlug(title: string, requestedSlug?: string) {
  const candidate = slugify(requestedSlug?.trim() || title.trim());
  return candidate || null;
}

export async function createProjectRecord(input: ProjectMutationInput) {
  const slug = buildProjectSlug(input.title, input.slug);
  if (!slug) throw new Error("INVALID_SLUG");

  const title = input.title.trim();
  if (!title) throw new Error("TITLE_REQUIRED");

  const assetIds = normalizeOrderedAssetIds(input.assetIds ?? []);

  return db.$transaction(async (tx) => {
    const normalizedAssetIds = await ensureValidLinkedAssets(tx, assetIds, input.coverAssetId);

    const project = await tx.project.create({
      data: {
        title,
        slug,
        description: input.description?.trim() || null,
        serviceSlug: input.serviceSlug?.trim() || null,
        areaSlug: input.areaSlug?.trim() || null,
        location: input.location?.trim() || null,
        published: Boolean(input.published),
        featured: Boolean(input.featured),
        spotlightRank: input.spotlightRank ?? null,
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
  const slug = buildProjectSlug(input.title, input.slug);
  if (!slug) throw new Error("INVALID_SLUG");

  const title = input.title.trim();
  if (!title) throw new Error("TITLE_REQUIRED");

  const assetIds = normalizeOrderedAssetIds(input.assetIds ?? []);

  return db.$transaction(async (tx) => {
    const existing = await tx.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) throw new Error("PROJECT_NOT_FOUND");

    const normalizedAssetIds = await ensureValidLinkedAssets(tx, assetIds, input.coverAssetId);

    const project = await tx.project.update({
      where: { id },
      data: {
        title,
        slug,
        description: input.description?.trim() || null,
        serviceSlug: input.serviceSlug?.trim() || null,
        areaSlug: input.areaSlug?.trim() || null,
        location: input.location?.trim() || null,
        published: Boolean(input.published),
        featured: Boolean(input.featured),
        spotlightRank: input.spotlightRank ?? null,
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
    if (project.diagnosis !== "renderable_project") return false;
    if (!project.published) return false;
    if (filter.serviceSlug && project.serviceSlug !== filter.serviceSlug) return false;
    if (filter.areaSlug && project.areaSlug !== filter.areaSlug) return false;
    if (filter.featuredOnly && !project.featured) return false;
    return true;
  });

  const ordered = sortProjectsForPublic(filtered);
  return typeof filter.limit === "number" ? ordered.slice(0, filter.limit) : ordered;
}

export async function getHomepageSpotlightProjects(limit = 3): Promise<CanonicalProject[]> {
  const featured = await listPublicProjects({ featuredOnly: true, limit });
  if (featured.length) return featured;

  const fallback = await listPublicProjects();
  return fallback
    .filter((project) => project.publishedAssetCount > 0)
    .slice(0, limit)
    .map((project) => ({
      ...project,
      diagnosis: getProjectDiagnosis(project, { homepage: true }),
    }));
}

export async function listRenderableOrphanAssets() {
  if (!process.env.DATABASE_URL) return [];

  const assets = await db.asset.findMany({
    where: {
      published: true,
      projectLinks: {
        none: {},
      },
    },
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
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return assets
    .map((asset) => {
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
        requireProjectLink: true,
      });

      return {
        id: asset.id,
        title: asset.title,
        location: asset.location,
        primaryServiceSlug: asset.primaryServiceSlug,
        publicId: canonical.publicId,
        imageUrl: canonical.imageUrl,
        thumbnailUrl: canonical.thumbnailUrl,
        renderable: canonical.renderable,
        diagnosis: canonical.diagnosis,
        createdAt: asset.createdAt.toISOString(),
        uploadBatchId: asset.uploadBatchId,
        serviceTags,
        contextTags,
        contextSlugs,
      };
    })
    .filter((asset) => asset.renderable);
}

export async function getProjectVisibilityDebug(id: string) {
  const project = await getProjectRecordById(id);
  if (!project) return null;

  return {
    project,
    placements: {
      directProjectPage: project.diagnosis === "renderable_project" && project.published,
      galleryPage: project.diagnosis === "renderable_project" && project.published,
      homepageFeatured: project.diagnosis === "renderable_project" && project.published && project.featured,
      servicePageSection:
        project.diagnosis === "renderable_project" && project.published && Boolean(project.serviceSlug),
      areaPageSection:
        project.diagnosis === "renderable_project" && project.published && Boolean(project.areaSlug),
    },
  };
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
          published: false,
          featured: false,
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
