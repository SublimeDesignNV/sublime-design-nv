import { Prisma, ProjectStatus } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { findArea } from "@/content/areas";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import {
  createProjectRecord,
  listAdminProjects,
  listRecentPublishingActions,
  listRenderableOrphanAssets,
  listProjectOptions,
  listUploadBatchSummaries,
} from "@/lib/projectRecords.server";
import { isServiceTagSlug } from "@/lib/serviceTags";

type CreateProjectBody = {
  title?: string;
  slug?: string;
  description?: string;
  serviceSlug?: string;
  areaSlug?: string;
  location?: string;
  status?: ProjectStatus;
  published?: boolean;
  featured?: boolean;
  homepageSpotlight?: boolean;
  heroEligible?: boolean;
  spotlightRank?: number | null;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  testimonialPresent?: boolean;
  completionYear?: number | null;
  completionMonth?: number | null;
  internalNotes?: string;
  featuredReason?: string;
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

  const url = new URL(request.url);
  const recentFilter = url.searchParams.get("recent");
  const uploadedSince =
    recentFilter === "today"
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : recentFilter === "week"
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : undefined;

  const [projects, orphanAssets, projectOptions, uploadBatches, recentPublishingActions] = await Promise.all([
    listAdminProjects(),
    listRenderableOrphanAssets({ uploadedSince }),
    listProjectOptions(),
    listUploadBatchSummaries({ uploadedSince }),
    listRecentPublishingActions(),
  ]);

  return NextResponse.json({
    ok: true,
    projects,
    orphanAssets,
    projectOptions,
    uploadBatches,
    recentPublishingActions,
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
      status: body.status,
      published: Boolean(body.published),
      featured: Boolean(body.featured),
      homepageSpotlight: Boolean(body.homepageSpotlight),
      heroEligible: Boolean(body.heroEligible),
      spotlightRank:
        typeof body.spotlightRank === "number" ? body.spotlightRank : null,
      primaryCtaLabel: body.primaryCtaLabel?.trim() || null,
      primaryCtaHref: body.primaryCtaHref?.trim() || null,
      testimonialPresent: Boolean(body.testimonialPresent),
      completionYear:
        typeof body.completionYear === "number" ? body.completionYear : null,
      completionMonth:
        typeof body.completionMonth === "number" ? body.completionMonth : null,
      internalNotes: body.internalNotes?.trim() || null,
      featuredReason: body.featuredReason?.trim() || null,
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
