import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "15");

  const assets = await db.asset.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      secureUrl: true,
      kind: true,
      alt: true,
      width: true,
      height: true,
      projectLinks: {
        take: 1,
        select: {
          project: {
            select: {
              title: true,
              slug: true,
              location: true,
              serviceSlug: true,
              areaSlug: true,
            },
          },
        },
      },
    },
  });

  const result = assets.map((a) => ({
    id: a.id,
    url: a.secureUrl,
    kind: a.kind,
    alt: a.alt,
    width: a.width,
    height: a.height,
    project: a.projectLinks[0]?.project ?? null,
  }));

  return NextResponse.json(result);
}
