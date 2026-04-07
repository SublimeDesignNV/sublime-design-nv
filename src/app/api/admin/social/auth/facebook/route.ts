import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "Facebook credentials not configured." }, { status: 503 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const redirectUri = encodeURIComponent(`${baseUrl}/api/admin/social/auth/facebook/callback`);
  const scope = encodeURIComponent("pages_manage_posts,pages_read_engagement,publish_video");
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return NextResponse.redirect(url);
}
