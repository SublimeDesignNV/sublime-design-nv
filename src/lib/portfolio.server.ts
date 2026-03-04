import "server-only";
import { db } from "@/lib/db";
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
