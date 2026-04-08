import { db } from "@/lib/db";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findFirst({
    where: { platform: "youtube", connected: true },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error("YouTube not connected. Go to Social → Settings to connect.");
  return account.accessToken;
}

export async function getChannelInfo() {
  const token = await getAccessToken();
  const res = await fetch(`${YOUTUBE_API}/channels?part=snippet,statistics&mine=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`YouTube API error (${res.status})`);
  return res.json() as Promise<{ items: { id: string; snippet: { title: string }; statistics: { subscriberCount: string; viewCount: string } }[] }>;
}

// Note: Video upload requires streaming multipart upload.
// This stub initiates a resumable upload session.
export async function initiateVideoUpload({
  title,
  description,
  tags,
  visibility = "public",
}: {
  title: string;
  description: string;
  tags: string[];
  visibility?: "public" | "unlisted" | "private";
}) {
  const token = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": "video/*",
      },
      body: JSON.stringify({
        snippet: { title, description, tags },
        status: { privacyStatus: visibility },
      }),
    }
  );
  if (!res.ok) throw new Error(`YouTube API error (${res.status})`);
  // Returns Location header with resumable upload URL
  return { uploadUrl: res.headers.get("location") };
}
