import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const [totalPosts, postedCount, pendingCount, failedCount] = await Promise.all([
    db.scheduledPost.count(),
    db.scheduledPost.count({ where: { status: "posted" } }),
    db.scheduledPost.count({ where: { status: "pending" } }),
    db.scheduledPost.count({ where: { status: "failed" } }),
  ]);

  return Response.json({
    summary: { totalPosts, postedCount, pendingCount, failedCount },
    platforms: {
      instagram: { followers: null, reach: null, impressions: null },
      facebook: { followers: null, reach: null, impressions: null },
      pinterest: { followers: null, monthlyViews: null },
      youtube: { subscribers: null, views: null },
    },
  });
}
