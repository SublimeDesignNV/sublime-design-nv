import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const { imageUrl, caption } = (await req.json()) as { imageUrl?: string; caption?: string };
  const token = process.env.META_SYSTEM_USER_TOKEN;
  const pageId = process.env.META_FACEBOOK_PAGE_ID;

  if (!token || !pageId) {
    return NextResponse.json({ error: "Facebook not configured" }, { status: 503 });
  }

  if (!imageUrl || !caption) {
    return NextResponse.json({ error: "imageUrl and caption are required" }, { status: 400 });
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/photos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl, message: caption, access_token: token }),
    },
  );
  const data = (await res.json()) as { id?: string; error?: unknown };

  if (!data.id) {
    return NextResponse.json({ error: "Post failed", detail: data }, { status: 500 });
  }

  return NextResponse.json({ success: true, postId: data.id });
}
