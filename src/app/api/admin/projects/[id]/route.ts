import { NextResponse, type NextRequest } from "next/server";
import { findArea } from "@/content/areas";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProjectRecord } from "@/lib/projectRecords.server";
import { isServiceTagSlug } from "@/lib/serviceTags";

type UpdateProjectBody = {
  title?: string;
  slug?: string;
  description?: string;
  serviceSlug?: string;
  areaSlug?: string;
  location?: string;
  published?: boolean;
  featured?: boolean;
  spotlightRank?: number | null;
  coverAssetId?: string | null;
  assetIds?: string[];
};

function validateProjectBody(body: UpdateProjectBody) {
  const title = body.title?.trim();
  if (!title) {
    return { ok: false as const, error: "title is required." };
  }

  if (body.serviceSlug?.trim() && !isServiceTagSlug(body.serviceSlug.trim())) {
    return { ok: false as const, error: "A valid service is required." };
  }

  if (body.areaSlug?.trim() && !findArea(body.areaSlug.trim())) {
    return { ok: false as const, error: "A valid area is required." };
  }

  if (!body.assetIds?.length) {
    return { ok: false as const, error: "A project needs at least one linked asset." };
  }

  return { ok: true as const };
}

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

  const body = (await request.json().catch(() => ({}))) as UpdateProjectBody;
  const validation = validateProjectBody(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const project = await updateProjectRecord(context.params.id, {
      title: body.title!.trim(),
      slug: body.slug?.trim() || undefined,
      description: body.description?.trim() || null,
      serviceSlug: body.serviceSlug?.trim() || null,
      areaSlug: body.areaSlug?.trim() || null,
      location: body.location?.trim() || null,
      published: Boolean(body.published),
      featured: Boolean(body.featured),
      spotlightRank:
        typeof body.spotlightRank === "number" ? body.spotlightRank : null,
      coverAssetId: body.coverAssetId?.trim() || null,
      assetIds: body.assetIds,
    });

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update project.";
    const status =
      message === "PROJECT_NOT_FOUND"
        ? 404
        : message === "INVALID_ASSET_IDS" ||
            message === "INVALID_COVER_ASSET" ||
            message === "INVALID_SLUG"
          ? 400
          : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
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
    await db.project.delete({
      where: { id: context.params.id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }
}
