import { type NextRequest, NextResponse } from "next/server";
import { AssetKind } from "@prisma/client";
import { db } from "@/lib/db";
import { getServiceLookupSlugs } from "@/content/services";
import type { PortfolioResponse } from "@/lib/portfolio.types";
import { buildCanonicalAssetFields, getAssetTagBuckets } from "@/lib/assetContract";

function parseKind(kind: string | null): AssetKind | undefined {
  if (!kind) return undefined;

  const normalized = kind.toLowerCase();
  if (normalized === "image") return AssetKind.IMAGE;
  if (normalized === "video") return AssetKind.VIDEO;
  return undefined;
}

export async function GET(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    const fallback: PortfolioResponse = { assets: [] };
    return NextResponse.json(fallback);
  }

  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get("service");
  const kind = parseKind(searchParams.get("kind"));
  const serviceLookupSlugs = service ? getServiceLookupSlugs(service) : undefined;

  const assets = await db.asset.findMany({
    where: {
      published: true,
      ...(kind ? { kind } : {}),
      ...(service
        ? {
            OR: [
              {
                primaryServiceSlug: {
                  in: serviceLookupSlugs,
                },
              },
              {
                tags: {
                  some: {
                    serviceType: {
                      tagType: "SERVICE",
                      slug: {
                        in: serviceLookupSlugs,
                      },
                    },
                  },
                },
              },
            ],
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
              tagType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const normalizedAssets = assets.map((asset) => {
    const tags = asset.tags.map((tag) => ({
      slug: tag.serviceType.slug,
      title: tag.serviceType.title,
      tagType: tag.serviceType.tagType,
    }));
    const { contextTags, serviceTags, contextSlugs } = getAssetTagBuckets(tags);
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
      title: asset.title,
      description: asset.description,
      location: asset.location,
      primaryServiceSlug: asset.primaryServiceSlug,
      serviceMetadata:
        asset.serviceMetadata && typeof asset.serviceMetadata === "object"
          ? (asset.serviceMetadata as Record<string, unknown>)
          : null,
      alt: asset.alt,
      createdAt: asset.createdAt,
      projectId: canonical.projectId,
      projectSlug: canonical.projectSlug,
      tags,
      serviceTags,
      contextTags,
      contextSlugs,
    };
  });

  return NextResponse.json({ assets: normalizedAssets } satisfies PortfolioResponse);
}
