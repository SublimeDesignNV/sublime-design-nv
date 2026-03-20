import { AssetKind, Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { findService } from "@/content/services";
import { db } from "@/lib/db";
import {
  getServiceTagBySlug,
  isServiceTagSlug,
  normalizeServiceTagSlugs,
} from "@/lib/serviceTags";
import {
  buildAssetAltText,
  validateServiceAssetMetadata,
} from "@/lib/serviceAssetMetadata";

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
  title?: string;
  description?: string;
  location?: string;
  primaryServiceSlug?: string;
  serviceMetadata?: unknown;
  published?: boolean;
  tagSlugs?: string[];
};

function getDbUnavailableResponse() {
  return NextResponse.json(
    { ok: false, error: "DATABASE_URL is not configured." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  void request;
  if (!(await requireAdminApiSession())) {
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
  if (!(await requireAdminApiSession())) {
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
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "title is required." },
      { status: 400 },
    );
  }

  const primaryServiceSlug = body.primaryServiceSlug?.trim()
    ? body.primaryServiceSlug.trim()
    : normalizeServiceTagSlugs(body.tagSlugs)[0];

  if (!primaryServiceSlug || !isServiceTagSlug(primaryServiceSlug)) {
    return NextResponse.json(
      { ok: false, error: "A valid primary service is required." },
      { status: 400 },
    );
  }

  const metadataValidation = validateServiceAssetMetadata(
    primaryServiceSlug,
    body.serviceMetadata,
  );
  if (!metadataValidation.ok) {
    return NextResponse.json(
      { ok: false, error: metadataValidation.errors.join(" ") },
      { status: 400 },
    );
  }

  const tagSlugs = normalizeServiceTagSlugs(
    body.tagSlugs?.length ? body.tagSlugs : [primaryServiceSlug],
  );
  const invalid = tagSlugs.filter((slug) => !isServiceTagSlug(slug));
  if (invalid.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Invalid service tag slugs: ${invalid.join(", ")}` },
      { status: 400 },
    );
  }

  const description = body.description?.trim() || null;
  const location = body.location?.trim() || null;
  const alt = body.alt?.trim() || buildAssetAltText({ title, location, primaryServiceSlug });

  try {
    const asset = await db.$transaction(async (tx) => {
      const serviceTypes = await Promise.all(
        tagSlugs.map(async (slug) => {
          const serviceTag = getServiceTagBySlug(slug);
          if (!serviceTag) {
            throw new Error(`Invalid service tag slug: ${slug}`);
          }

          return tx.serviceType.upsert({
            where: { slug: serviceTag.slug },
            update: { title: serviceTag.title },
            create: {
              slug: serviceTag.slug,
              title: serviceTag.title,
            },
            select: {
              id: true,
              slug: true,
            },
          });
        }),
      );

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
          title,
          description,
          location,
          primaryServiceSlug,
          serviceMetadata: metadataValidation.data as Prisma.InputJsonValue,
          alt: alt || null,
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
