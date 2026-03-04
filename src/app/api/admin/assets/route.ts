import { AssetKind, Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { db } from "@/lib/db";

type CreateAssetBody = {
  kind?: AssetKind;
  publicId?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bytes?: number;
  alt?: string;
  published?: boolean;
  tagSlugs?: string[];
};

function getDbUnavailableResponse() {
  return NextResponse.json(
    { ok: false, error: "DATABASE_URL is not configured." },
    { status: 503 },
  );
}

function normalizeTagSlugs(tagSlugs: unknown) {
  if (!Array.isArray(tagSlugs)) return [];
  return Array.from(
    new Set(
      tagSlugs
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return getDbUnavailableResponse();
  }

  const assets = await db.asset.findMany({
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

  return NextResponse.json({
    assets: assets.map((asset) => ({
      id: asset.id,
      kind: asset.kind,
      publicId: asset.publicId,
      secureUrl: asset.secureUrl,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      format: asset.format,
      bytes: asset.bytes,
      alt: asset.alt,
      published: asset.published,
      createdAt: asset.createdAt,
      tags: asset.tags.map((tag) => ({
        slug: tag.serviceType.slug,
        title: tag.serviceType.title,
      })),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return getDbUnavailableResponse();
  }

  const body = (await request.json().catch(() => ({}))) as CreateAssetBody;

  if (!body.publicId || !body.secureUrl) {
    return NextResponse.json(
      { ok: false, error: "publicId and secureUrl are required." },
      { status: 400 },
    );
  }

  if (body.kind !== AssetKind.IMAGE && body.kind !== AssetKind.VIDEO) {
    return NextResponse.json(
      { ok: false, error: "kind must be IMAGE or VIDEO." },
      { status: 400 },
    );
  }
  const kind: AssetKind = body.kind;
  const publicId = body.publicId;
  const secureUrl = body.secureUrl;

  const tagSlugs = normalizeTagSlugs(body.tagSlugs);
  if (tagSlugs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "At least one service tag is required." },
      { status: 400 },
    );
  }

  const serviceTypes = await db.serviceType.findMany({
    where: {
      slug: {
        in: tagSlugs,
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (serviceTypes.length !== tagSlugs.length) {
    const validSlugs = new Set(serviceTypes.map((serviceType) => serviceType.slug));
    const invalid = tagSlugs.filter((slug) => !validSlugs.has(slug));
    return NextResponse.json(
      { ok: false, error: `Invalid service tag slugs: ${invalid.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const asset = await db.$transaction(async (tx) => {
      return tx.asset.create({
        data: {
          kind,
          publicId,
          secureUrl,
          width: body.width,
          height: body.height,
          duration: body.duration,
          format: body.format,
          bytes: body.bytes,
          alt: body.alt || null,
          published: Boolean(body.published),
          tags: {
            create: serviceTypes.map((serviceType) => ({
              serviceTypeId: serviceType.id,
            })),
          },
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
      });
    });

    return NextResponse.json({ ok: true, asset }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "Asset with this publicId already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to create asset." },
      { status: 500 },
    );
  }
}
