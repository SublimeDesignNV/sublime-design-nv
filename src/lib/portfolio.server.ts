import "server-only";
import { getProjectImageAltBySlug, getServiceImageAlt } from "@/lib/imageAlt";
import { findProject } from "@/content/projects";
import type { CloudinaryAsset } from "@/lib/cloudinary.server";
import { db } from "@/lib/db";
import { listProjectAssets, listAssetsByServiceTag, getProjectBySlug } from "@/lib/cloudinary.server";
import {
  getSeedPreviewAsset,
  getSeedImages,
  getFirstSeedAssetFromServices,
} from "@/lib/seedImages.server";
import type { PortfolioTag, PublishedAsset } from "@/lib/portfolio.types";

function mapPublishedAsset(asset: {
  id: string;
  kind: "IMAGE" | "VIDEO";
  secureUrl: string;
  alt: string | null;
  createdAt: Date;
  tags: Array<{ serviceType: PortfolioTag }>;
}): PublishedAsset {
  return {
    id: asset.id,
    kind: asset.kind,
    secureUrl: asset.secureUrl,
    alt: asset.alt,
    createdAt: asset.createdAt.toISOString(),
    tags: asset.tags.map((tag) => ({
      slug: tag.serviceType.slug,
      title: tag.serviceType.title,
    })),
  };
}

export async function getPublishedAssets(): Promise<PublishedAsset[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const assets = await db.asset.findMany({
      where: {
        published: true,
      },
      include: {
        tags: {
          include: {
            serviceType: {
              select: {
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assets.map(mapPublishedAsset);
  } catch {
    return [];
  }
}

export async function getPublishedAssetsByServiceSlug(
  slug?: string,
): Promise<PublishedAsset[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const assets = await db.asset.findMany({
      where: {
        published: true,
        ...(slug
          ? {
              tags: {
                some: {
                  serviceType: {
                    slug,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            serviceType: {
              select: {
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assets.map(mapPublishedAsset);
  } catch {
    return [];
  }
}

export type HeroAsset = {
  secureUrl: string;
  alt: string;
  publicId?: string;
};

function assetHasTag(assetTags: string[] | undefined, tag: string) {
  if (!assetTags?.length) return false;
  return assetTags.some((assetTag) => assetTag.toLowerCase() === tag.toLowerCase());
}

function assetIsFeatured(asset: {
  tags?: string[];
  context?: { featured?: string };
}) {
  if (assetHasTag(asset.tags, "featured")) return true;
  return asset.context?.featured?.toLowerCase() === "true";
}

export async function getHeroAsset(): Promise<HeroAsset | null> {
  const assets = await listProjectAssets(300).catch(() => []);

  if (assets.length) {
    const heroAsset = assets.find((asset) => assetHasTag(asset.tags, "hero"));
    const featuredAsset = assets.find((asset) => assetIsFeatured(asset));
    const selected = heroAsset ?? featuredAsset ?? assets[0];

    if (selected?.secure_url) {
      return {
        secureUrl: selected.secure_url,
        alt: selected.context?.alt || "Custom finish carpentry installation by Sublime Design NV in Las Vegas Valley",
        publicId: selected.public_id,
      };
    }
  }

  // Seed fallback — prefer floating-shelves, then built-ins
  const seedHero = getFirstSeedAssetFromServices(["floating-shelves", "built-ins"]);
  if (seedHero) {
    return {
      secureUrl: seedHero.src,
      alt: seedHero.alt,
    };
  }

  return null;
}

/** Source discriminator carried through all asset types. */
export type AssetSource = "cloudinary" | "seed";

export type ServicePreviewAsset = {
  /** Present for cloudinary assets; absent for seed images. */
  publicId?: string;
  secureUrl: string;
  alt: string;
  source: AssetSource;
};

/**
 * Returns the best preview image for a service card.
 * Priority: Cloudinary service-tagged asset → seed image → null (text placeholder).
 */
export async function getServiceCardPreviewAsset(
  slug: string,
): Promise<ServicePreviewAsset | null> {
  const assets = await listAssetsByServiceTag(slug, 1).catch(() => []);
  const asset = assets[0];

  if (asset?.secure_url) {
    return {
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
      alt: getServiceImageAlt({
        serviceSlug: slug,
        explicitAlt: asset.context?.alt,
      }),
      source: "cloudinary",
    };
  }

  const seed = getSeedPreviewAsset(slug);
  if (seed) {
    return {
      secureUrl: seed.src,
      alt: getServiceImageAlt({
        serviceSlug: slug,
        explicitAlt: seed.alt,
      }),
      source: "seed",
    };
  }

  return null;
}

export type ServiceGalleryAsset = {
  publicId?: string;
  secureUrl: string;
  alt: string;
  isFeatured: boolean;
  source: AssetSource;
};

/**
 * Returns gallery assets for a service page.
 * Priority: Cloudinary service-tagged assets → seed images → empty array.
 */
export async function getServiceAssets(slug: string): Promise<ServiceGalleryAsset[]> {
  const assets = await listAssetsByServiceTag(slug, 50).catch(() => []);

  if (assets.length) {
    return assets.map((asset) => ({
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
      alt: getServiceImageAlt({
        serviceSlug: slug,
        explicitAlt: asset.context?.alt,
      }),
      isFeatured: assetIsFeatured(asset),
      source: "cloudinary" as const,
    }));
  }

  const seedImages = getSeedImages(slug);
  return seedImages.map((img, index) => ({
    secureUrl: img.src,
    alt: getServiceImageAlt({
      serviceSlug: slug,
      explicitAlt: img.alt,
    }),
    isFeatured: index === 0,
    source: "seed" as const,
  }));
}

export type ProjectImageAsset = {
  publicId?: string;
  secureUrl: string;
  alt: string;
  source: AssetSource;
  caption?: string;
};

export type ProjectPreviewAsset = ProjectImageAsset;

function orderProjectAssetsByPreference(
  assets: CloudinaryAsset[],
  projectSlug: string,
) {
  const project = findProject(projectSlug);
  if (!project || !assets.length) return assets;

  const heroId = project.preferredHeroPublicId;
  const galleryIds = [
    ...(project.preferredGalleryPublicIds ?? []),
    ...(project.preferredGalleryFirstPublicId ? [project.preferredGalleryFirstPublicId] : []),
  ];
  const ordered = [...assets];

  ordered.sort((a, b) => {
    const rank = (asset: CloudinaryAsset) => {
      if (heroId && asset.public_id === heroId) return 0;
      const galleryIndex = galleryIds.findIndex((id) => id === asset.public_id);
      if (galleryIndex !== -1) return galleryIndex + 1;
      return galleryIds.length + 1;
    };

    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;

    return 0;
  });

  return ordered;
}

/**
 * Returns gallery images for a project page.
 * Priority: Cloudinary project folder → service-tagged Cloudinary → seed images → [].
 */
export async function getProjectImages(
  projectSlug: string,
  serviceSlug: string,
): Promise<ProjectImageAsset[]> {
  const project = findProject(projectSlug);

  // 1. Dedicated project folder in Cloudinary
  const cloudinaryProject = await getProjectBySlug(projectSlug).catch(() => null);
  if (cloudinaryProject?.images.length) {
    return orderProjectAssetsByPreference(cloudinaryProject.images, projectSlug).map((img, index) => ({
      publicId: img.public_id,
      secureUrl: img.secure_url,
      alt: getProjectImageAltBySlug({
        projectSlug,
        serviceSlug,
        explicitAlt: img.context?.alt,
        index,
        variant: index === 0 ? "hero" : "gallery",
      }),
      source: "cloudinary" as const,
      caption:
        index === 0
          ? project?.heroCaption
          : project?.galleryCaptions?.[index - 1],
    }));
  }

  // 2. Service-tagged Cloudinary assets
  const serviceAssets = await listAssetsByServiceTag(serviceSlug, 6).catch(() => []);
  if (serviceAssets.length) {
    return orderProjectAssetsByPreference(serviceAssets, projectSlug).map((asset, index) => ({
      publicId: asset.public_id,
      secureUrl: asset.secure_url,
      alt: getProjectImageAltBySlug({
        projectSlug,
        serviceSlug,
        explicitAlt: asset.context?.alt,
        index,
        variant: index === 0 ? "hero" : "gallery",
      }),
      source: "cloudinary" as const,
      caption:
        index === 0
          ? project?.heroCaption
          : project?.galleryCaptions?.[index - 1],
    }));
  }

  // 3. Seed images
  const seeds = getSeedImages(serviceSlug);
  return seeds.map((img, index) => ({
    secureUrl: img.src,
    alt: getProjectImageAltBySlug({
      projectSlug,
      serviceSlug,
      explicitAlt: img.alt,
      index,
      variant: index === 0 ? "hero" : "gallery",
    }),
    source: "seed" as const,
    caption:
      index === 0
        ? project?.heroCaption
        : project?.galleryCaptions?.[index - 1],
  }));
}

export async function getProjectCardPreviewAsset(
  projectSlug: string,
  serviceSlug: string,
): Promise<ProjectPreviewAsset | null> {
  const images = await getProjectImages(projectSlug, serviceSlug);
  return images[0] ?? null;
}

/**
 * Returns featured assets suitable for a homepage section.
 * Priority: hero-tagged → featured-tagged → newest Cloudinary → seed images.
 * Deduplicates across services.
 */
export async function getHomepageFeaturedAssets(max = 6): Promise<ServicePreviewAsset[]> {
  const assets = await listProjectAssets(300).catch(() => []);

  if (assets.length) {
    const hero = assets.filter((a) => assetHasTag(a.tags, "hero"));
    const featured = assets.filter((a) => assetIsFeatured(a) && !assetHasTag(a.tags, "hero"));
    const rest = assets.filter((a) => !assetIsFeatured(a) && !assetHasTag(a.tags, "hero"));

    const ordered = [...hero, ...featured, ...rest];
    const seen = new Set<string>();
    const result: ServicePreviewAsset[] = [];

    for (const asset of ordered) {
      if (!asset.secure_url || seen.has(asset.public_id)) continue;
      seen.add(asset.public_id);
      result.push({
        publicId: asset.public_id,
        secureUrl: asset.secure_url,
        alt: asset.context?.alt ?? "Custom finish carpentry project by Sublime Design NV in Las Vegas Valley",
        source: "cloudinary",
      });
      if (result.length >= max) break;
    }

    if (result.length) return result;
  }

  // Seed fallback — pull from primary services in order
  const seedSlugOrder = ["floating-shelves", "built-ins", "custom-cabinetry", "mantels"];
  const seedResult: ServicePreviewAsset[] = [];

  for (const slug of seedSlugOrder) {
    const seed = getSeedPreviewAsset(slug);
    if (seed) {
      seedResult.push({ secureUrl: seed.src, alt: seed.alt, source: "seed" });
    }
    if (seedResult.length >= max) break;
  }

  return seedResult;
}
