import "server-only";
import { Prisma } from "@prisma/client";
import { findService } from "@/content/services";
import { buildCanonicalAssetFields, getAssetTagBuckets } from "@/lib/assetContract";
import { getAssetByPublicId } from "@/lib/cloudinary.server";

export const ASSET_DEBUG_SELECT = {
  id: true,
  kind: true,
  publicId: true,
  secureUrl: true,
  width: true,
  height: true,
  duration: true,
  format: true,
  bytes: true,
  title: true,
  description: true,
  location: true,
  primaryServiceSlug: true,
  serviceMetadata: true,
  alt: true,
  published: true,
  createdAt: true,
  updatedAt: true,
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
} as const;

export type AdminAssetDebugRow = Prisma.AssetGetPayload<{ select: typeof ASSET_DEBUG_SELECT }>;

export function serializeAdminAssetDebugRow(asset: AdminAssetDebugRow) {
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
    slug: canonical.slug,
    kind: asset.kind,
    published: asset.published,
    publicId: canonical.publicId,
    imageUrl: canonical.imageUrl,
    thumbnailUrl: canonical.thumbnailUrl,
    secureUrl: canonical.imageUrl,
    resourceType: canonical.resourceType,
    format: canonical.format,
    width: canonical.width,
    height: canonical.height,
    duration: asset.duration,
    bytes: asset.bytes,
    title: asset.title,
    description: asset.description,
    location: asset.location,
    primaryServiceSlug: asset.primaryServiceSlug,
    primaryServiceLabel: asset.primaryServiceSlug
      ? (findService(asset.primaryServiceSlug)?.shortTitle ?? asset.primaryServiceSlug)
      : null,
    serviceMetadata:
      asset.serviceMetadata && typeof asset.serviceMetadata === "object"
        ? (asset.serviceMetadata as Record<string, unknown>)
        : null,
    alt: asset.alt,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    projectId: canonical.projectId,
    projectSlug: canonical.projectSlug,
    projectTitle: canonical.projectTitle,
    renderable: canonical.renderable,
    diagnosis: canonical.diagnosis,
    tags,
    serviceTags,
    contextTags,
    contextSlugs,
  };
}

export async function buildAssetDebugReport(asset: AdminAssetDebugRow) {
  const serialized = serializeAdminAssetDebugRow(asset);
  const cloudinary = serialized.publicId
    ? await getAssetByPublicId(serialized.publicId)
    : null;

  return {
    rawDbRow: {
      id: asset.id,
      kind: asset.kind,
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      format: asset.format,
      bytes: asset.bytes,
      title: asset.title,
      description: asset.description,
      location: asset.location,
      primaryServiceSlug: asset.primaryServiceSlug,
      serviceMetadata: asset.serviceMetadata,
      alt: asset.alt,
      published: asset.published,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      tags: serialized.tags,
    },
    serializedAsset: serialized,
    cloudinary: cloudinary
      ? {
          publicId: cloudinary.public_id,
          secureUrl: cloudinary.secure_url,
          width: cloudinary.width ?? null,
          height: cloudinary.height ?? null,
          format: cloudinary.format ?? null,
          context: cloudinary.context ?? {},
          tags: cloudinary.tags ?? [],
        }
      : null,
    projectLinkage: {
      projectId: serialized.projectId,
      projectSlug: serialized.projectSlug,
      projectTitle: serialized.projectTitle,
      hasProjectDefinition: Boolean(serialized.projectTitle),
      source: serialized.projectSlug ? "public_id_prefix" : "none",
    },
    frontendPaths: {
      adminList: Boolean(serialized.imageUrl),
      servicePage: Boolean(
        serialized.published &&
          serialized.imageUrl &&
          (serialized.primaryServiceSlug || serialized.serviceTags.length),
      ),
      projectPage: Boolean(serialized.imageUrl && serialized.projectSlug),
      galleryPage: Boolean(serialized.imageUrl && serialized.projectSlug),
    },
    diagnosis: serialized.diagnosis,
  };
}

export function compareAssetDebugReports(
  working: Awaited<ReturnType<typeof buildAssetDebugReport>>,
  broken: Awaited<ReturnType<typeof buildAssetDebugReport>>,
) {
  return {
    publicId: {
      working: working.serializedAsset.publicId,
      broken: broken.serializedAsset.publicId,
    },
    imageUrl: {
      working: working.serializedAsset.imageUrl,
      broken: broken.serializedAsset.imageUrl,
    },
    thumbnailUrl: {
      working: working.serializedAsset.thumbnailUrl,
      broken: broken.serializedAsset.thumbnailUrl,
    },
    published: {
      working: working.serializedAsset.published,
      broken: broken.serializedAsset.published,
    },
    projectSlug: {
      working: working.serializedAsset.projectSlug,
      broken: broken.serializedAsset.projectSlug,
    },
    tags: {
      working: working.serializedAsset.tags,
      broken: broken.serializedAsset.tags,
    },
    resourceType: {
      working: working.serializedAsset.resourceType,
      broken: broken.serializedAsset.resourceType,
    },
    format: {
      working: working.serializedAsset.format,
      broken: broken.serializedAsset.format,
    },
    diagnosis: {
      working: working.diagnosis,
      broken: broken.diagnosis,
    },
  };
}
