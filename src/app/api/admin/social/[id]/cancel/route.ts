import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured." }, { status: 503 });
  }

  const { id } = await params;
  const post = await db.scheduledPost.findUnique({ where: { id }, select: { status: true } });
  if (!post) return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  if (post.status !== "pending") {
    return NextResponse.json({ ok: false, error: "Only pending posts can be cancelled." }, { status: 400 });
  }

  const updated = await db.scheduledPost.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ ok: true, post: updated });
}
