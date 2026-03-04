import { type NextRequest, NextResponse } from "next/server";
import { AssetKind } from "@prisma/client";
import { db } from "@/lib/db";
import type { PortfolioResponse } from "@/lib/portfolio.types";

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

  const assets = await db.asset.findMany({
    where: {
      published: true,
      ...(kind ? { kind } : {}),
      ...(service
        ? {
            tags: {
              some: {
                serviceType: {
                  slug: service,
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

  const response: PortfolioResponse = {
    assets: assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind,
      secureUrl: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      alt: asset.alt,
      createdAt: asset.createdAt,
      tags: asset.tags.map((tag) => ({
        slug: tag.serviceType.slug,
        title: tag.serviceType.title,
      })),
    })),
  };

  return NextResponse.json(response);
}
