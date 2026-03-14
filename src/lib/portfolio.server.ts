import "server-only";
import { db } from "@/lib/db";
import { listProjectAssets, listAssetsByServiceTag } from "@/lib/cloudinary.server";
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
  publicId: string;
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
  if (!assets.length) return null;

  const heroAsset = assets.find((asset) => assetHasTag(asset.tags, "hero"));
  const featuredAsset = assets.find((asset) => assetIsFeatured(asset));
  const selected = heroAsset ?? featuredAsset ?? assets[0];

  if (!selected?.secure_url) return null;

  return {
    secureUrl: selected.secure_url,
    alt: selected.context?.alt || "Custom finish carpentry project in Las Vegas Valley",
    publicId: selected.public_id,
  };
}

export type ServicePreviewAsset = {
  publicId: string;
  secureUrl: string;
  alt: string;
};

/**
 * Returns the best preview image for a service card.
 * Priority: Cloudinary service-tagged asset → null (show placeholder).
 *
 * Repo content paths are not publicly served, so we rely on Cloudinary.
 */
export async function getServiceCardPreviewAsset(
  slug: string,
): Promise<ServicePreviewAsset | null> {
  const assets = await listAssetsByServiceTag(slug, 1).catch(() => []);
  const asset = assets[0];
  if (!asset?.secure_url) return null;
  return {
    publicId: asset.public_id,
    secureUrl: asset.secure_url,
    alt: asset.context?.alt ?? `Custom ${slug.replace(/-/g, " ")} in Las Vegas`,
  };
}

export type ServiceGalleryAsset = {
  publicId: string;
  secureUrl: string;
  alt: string;
  isFeatured: boolean;
};

/**
 * Returns gallery assets for a service page.
 * Priority: Cloudinary service-tagged assets → empty array.
 */
export async function getServiceAssets(slug: string): Promise<ServiceGalleryAsset[]> {
  const assets = await listAssetsByServiceTag(slug, 50).catch(() => []);
  return assets.map((asset) => ({
    publicId: asset.public_id,
    secureUrl: asset.secure_url,
    alt: asset.context?.alt ?? `Custom ${slug.replace(/-/g, " ")} project in Las Vegas`,
    isFeatured: assetIsFeatured(asset),
  }));
}

/**
 * Returns featured assets suitable for a homepage section.
 * Priority: hero-tagged → featured-tagged → newest.
 * Deduplicates across services.
 */
export async function getHomepageFeaturedAssets(max = 6): Promise<ServicePreviewAsset[]> {
  const assets = await listProjectAssets(300).catch(() => []);
  if (!assets.length) return [];

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
      alt: asset.context?.alt ?? "Custom finish carpentry project in Las Vegas",
    });
    if (result.length >= max) break;
  }

  return result;
}
