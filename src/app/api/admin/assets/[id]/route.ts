import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServiceTagBySlug, isServiceTagSlug, normalizeServiceTagSlugs } from "@/lib/serviceTags";
import { buildAssetAltText, validateServiceAssetMetadata } from "@/lib/serviceAssetMetadata";

type UpdateAssetBody = {
  title?: string;
  description?: string;
  location?: string;
  primaryServiceSlug?: string;
  serviceMetadata?: unknown;
  published?: boolean;
  tagSlugs?: string[];
};

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as UpdateAssetBody;
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { ok: false, error: "title is required." },
      { status: 400 },
    );
  }

  const primaryServiceSlug = body.primaryServiceSlug?.trim();
  if (!primaryServiceSlug || !isServiceTagSlug(primaryServiceSlug)) {
    return NextResponse.json(
      { ok: false, error: "A valid primary service is required." },
      { status: 400 },
    );
  }

  const tagSlugs = normalizeServiceTagSlugs([
    primaryServiceSlug,
    ...(body.tagSlugs ?? []),
  ]);

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

  try {
    const asset = await db.$transaction(async (tx) => {
      const existing = await tx.asset.findUnique({
        where: { id: context.params.id },
        select: {
          id: true,
          alt: true,
        },
      });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

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
            },
          });
        }),
      );

      return tx.asset.update({
        where: { id: context.params.id },
        data: {
          title,
          description: body.description?.trim() || null,
          location: body.location?.trim() || null,
          primaryServiceSlug,
          serviceMetadata: metadataValidation.data as Prisma.InputJsonValue,
          published: Boolean(body.published),
          alt:
            existing.alt ||
            buildAssetAltText({
              title,
              location: body.location?.trim() || null,
              primaryServiceSlug,
            }),
          tags: {
            deleteMany: {},
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

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json(
        { ok: false, error: "Asset not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Failed to update asset." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } },
) {
  void request;

  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  try {
    // Phase-1 delete removes only the database record. Cloudinary cleanup can be added separately.
    await db.asset.delete({
      where: { id: context.params.id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Asset not found." },
      { status: 404 },
    );
  }
}
