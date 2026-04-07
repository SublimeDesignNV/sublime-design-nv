import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/admin/social?tab=settings&error=oauth_cancelled", req.url));
  }

  const appId = process.env.FACEBOOK_APP_ID!;
  const appSecret = process.env.FACEBOOK_APP_SECRET!;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const redirectUri = `${baseUrl}/api/admin/social/auth/facebook/callback`;

  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/admin/social?tab=settings&error=token_exchange", req.url));
  }
  const tokenData = (await tokenRes.json()) as { access_token: string };

  const pagesRes = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${tokenData.access_token}`
  );
  const pagesData = (await pagesRes.json()) as { data?: Array<{ id: string; name: string }> };
  const page = pagesData.data?.[0];

  await db.socialAccount.upsert({
    where: { platform: "facebook" },
    create: {
      platform: "facebook",
      accessToken: tokenData.access_token,
      accountId: page?.id,
      accountName: page?.name,
      connected: true,
      connectedAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      accessToken: tokenData.access_token,
      accountId: page?.id,
      accountName: page?.name,
      connected: true,
      connectedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL("/admin/social?tab=settings&connected=facebook", req.url));
}
