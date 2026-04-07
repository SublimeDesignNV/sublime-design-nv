import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "Instagram/Facebook credentials not configured." }, { status: 503 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const redirectUri = encodeURIComponent(`${baseUrl}/api/admin/social/auth/instagram/callback`);
  const scope = encodeURIComponent("instagram_basic,instagram_content_publish,pages_read_engagement");
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return NextResponse.redirect(url);
}
