import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const { imageUrl, caption } = (await req.json()) as { imageUrl?: string; caption?: string };
  const token = process.env.META_SYSTEM_USER_TOKEN;
  const igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;

  if (!token || !igAccountId) {
    return NextResponse.json({ error: "Instagram not configured" }, { status: 503 });
  }

  if (!imageUrl || !caption) {
    return NextResponse.json({ error: "imageUrl and caption are required" }, { status: 400 });
  }

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    },
  );
  const container = (await containerRes.json()) as { id?: string; error?: unknown };
  if (!container.id) {
    return NextResponse.json({ error: "Container creation failed", detail: container }, { status: 500 });
  }

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: container.id, access_token: token }),
    },
  );
  const published = (await publishRes.json()) as { id?: string; error?: unknown };

  if (!published.id) {
    return NextResponse.json({ error: "Publish failed", detail: published }, { status: 500 });
  }

  return NextResponse.json({ success: true, postId: published.id });
}
