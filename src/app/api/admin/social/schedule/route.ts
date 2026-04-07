import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

type ScheduleBody = {
  projectId?: string;
  platform?: string;
  caption?: string;
  hashtags?: string;
  mediaAssetIds?: string[];
  scheduledFor?: string | null;
};

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as ScheduleBody;

  if (!body.projectId) return NextResponse.json({ ok: false, error: "projectId is required." }, { status: 400 });
  if (!body.platform || !["instagram", "facebook", "both"].includes(body.platform)) {
    return NextResponse.json({ ok: false, error: "platform must be instagram, facebook, or both." }, { status: 400 });
  }
  if (!body.caption?.trim()) return NextResponse.json({ ok: false, error: "caption is required." }, { status: 400 });

  const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;

  const post = await db.scheduledPost.create({
    data: {
      projectId: body.projectId,
      platform: body.platform,
      caption: body.caption.trim(),
      hashtags: body.hashtags?.trim() || null,
      mediaAssetIds: body.mediaAssetIds ?? [],
      scheduledFor,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, post }, { status: 201 });
}

export async function GET(request: NextRequest) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  const posts = await db.scheduledPost.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, title: true, slug: true } } },
    take: 100,
  });

  return NextResponse.json({ ok: true, posts });
}
