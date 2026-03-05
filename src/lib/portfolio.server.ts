import "server-only";
import { db } from "@/lib/db";
import { listProjectAssets } from "@/lib/cloudinary.server";
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
