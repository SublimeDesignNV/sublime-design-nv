import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

type ComposeBody = {
  platforms: string[];
  caption: string;
  hashtags?: string;
  mediaUrls?: string[];
  scheduledFor?: string;
  pinTitle?: string;
  pinUrl?: string;
  boardId?: string;
  title?: string;
  description?: string;
  visibility?: string;
};

export async function POST(req: Request) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const body = (await req.json().catch(() => ({}))) as ComposeBody;
  const { platforms, caption, hashtags, mediaUrls, scheduledFor, pinTitle, pinUrl, boardId, title, description, visibility } = body;

  if (!platforms?.length || !caption?.trim()) {
    return Response.json({ error: "platforms and caption are required" }, { status: 400 });
  }

  const posts = await Promise.all(
    platforms.map((platform) =>
      db.scheduledPost.create({
        data: {
          platform,
          caption: caption.trim(),
          hashtags: hashtags?.trim() ?? null,
          mediaAssetIds: mediaUrls ?? [],
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          status: "pending",
          pinTitle: pinTitle ?? null,
          pinUrl: pinUrl ?? null,
          boardId: boardId ?? null,
          title: title ?? null,
          description: description ?? null,
          visibility: visibility ?? null,
        },
      })
    )
  );

  return Response.json({ posts }, { status: 201 });
}
