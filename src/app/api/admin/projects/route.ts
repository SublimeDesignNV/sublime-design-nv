import { Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { findArea } from "@/content/areas";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import {
  createProjectRecord,
  listAdminProjects,
  listRenderableOrphanAssets,
  listProjectOptions,
} from "@/lib/projectRecords.server";
import { isServiceTagSlug } from "@/lib/serviceTags";

type CreateProjectBody = {
  title?: string;
  slug?: string;
  description?: string;
  serviceSlug?: string;
  areaSlug?: string;
  location?: string;
  published?: boolean;
  featured?: boolean;
  spotlightRank?: number | null;
  coverAssetId?: string;
  assetIds?: string[];
};

function validateProjectBody(body: CreateProjectBody) {
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
    return { ok: false as const, error: "Select at least one asset." };
  }

  return { ok: true as const };
}

export async function GET(request: NextRequest) {
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

  const [projects, orphanAssets, projectOptions] = await Promise.all([
    listAdminProjects(),
    listRenderableOrphanAssets(),
    listProjectOptions(),
  ]);

  return NextResponse.json({
    ok: true,
    projects,
    orphanAssets,
    projectOptions,
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as CreateProjectBody;
  const validation = validateProjectBody(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  try {
    const project = await createProjectRecord({
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

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "Project slug already exists." },
        { status: 409 },
      );
    }

    const message = error instanceof Error ? error.message : "Failed to create project.";
    const status =
      message === "INVALID_ASSET_IDS" ||
      message === "INVALID_COVER_ASSET" ||
      message === "INVALID_SLUG"
        ? 400
        : 500;

    return NextResponse.json(
      { ok: false, error: message },
      { status },
    );
  }
}
