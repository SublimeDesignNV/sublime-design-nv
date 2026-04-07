import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { SOCIAL_ENABLED } from "@/lib/social/config";
import {
  createInstagramContainer,
  publishInstagramContainer,
  publishInstagramCarousel,
  postToFacebook,
} from "@/lib/social/meta";

type PublishBody = {
  postId?: string;
};

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as PublishBody;
  if (!body.postId) return NextResponse.json({ ok: false, error: "postId is required." }, { status: 400 });

  const scheduledPost = await db.scheduledPost.findUnique({ where: { id: body.postId } });
  if (!scheduledPost) return NextResponse.json({ ok: false, error: "Scheduled post not found." }, { status: 404 });
  if (scheduledPost.status === "posted") {
    return NextResponse.json({ ok: false, error: "Post already published." }, { status: 400 });
  }

  const platform = scheduledPost.platform as "instagram" | "facebook" | "both";
  const fullCaption = scheduledPost.hashtags
    ? `${scheduledPost.caption}\n\n${scheduledPost.hashtags}`
    : scheduledPost.caption;

  // If credentials not configured, queue for later
  const igEnabled = platform === "instagram" || platform === "both" ? SOCIAL_ENABLED.instagram : true;
  const fbEnabled = platform === "facebook" || platform === "both" ? SOCIAL_ENABLED.facebook : true;

  if (!igEnabled || !fbEnabled) {
    return NextResponse.json({
      ok: true,
      queued: true,
      message: "Credentials not yet configured. Post saved and will publish automatically when credentials are added.",
    });
  }

  // Resolve asset URLs from DB
  const assetUrls: string[] = [];
  if (scheduledPost.mediaAssetIds.length > 0) {
    const assets = await db.asset.findMany({
      where: { id: { in: scheduledPost.mediaAssetIds } },
      select: { id: true, secureUrl: true },
    });
    // Preserve order
    for (const id of scheduledPost.mediaAssetIds) {
      const asset = assets.find((a) => a.id === id);
      if (asset?.secureUrl) assetUrls.push(asset.secureUrl);
    }
  }

  const firstImageUrl = assetUrls[0];
  const results: { platform: string; postId: string }[] = [];

  try {
    if (platform === "instagram" || platform === "both") {
      let igPostId: string;
      if (assetUrls.length > 1) {
        const result = await publishInstagramCarousel(assetUrls, fullCaption);
        igPostId = result.id ?? "";
      } else if (firstImageUrl) {
        const container = await createInstagramContainer(firstImageUrl, fullCaption);
        if (!container.id) throw new Error(`IG container error: ${container.error?.message}`);
        const published = await publishInstagramContainer(container.id);
        igPostId = published.id ?? "";
      } else {
        throw new Error("Instagram post requires at least one image.");
      }
      results.push({ platform: "instagram", postId: igPostId });
    }

    if (platform === "facebook" || platform === "both") {
      const result = await postToFacebook(fullCaption, firstImageUrl);
      results.push({ platform: "facebook", postId: result.id ?? "" });
    }

    await db.scheduledPost.update({
      where: { id: scheduledPost.id },
      data: { status: "posted", postedAt: new Date(), postId: results.map((r) => r.postId).join(",") },
    });

    return NextResponse.json({ ok: true, queued: false, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown posting error.";
    await db.scheduledPost.update({
      where: { id: scheduledPost.id },
      data: { status: "failed", errorMessage: message },
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
