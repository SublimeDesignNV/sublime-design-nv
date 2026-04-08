import { db } from "@/lib/db";

const GBP_API = "https://mybusiness.googleapis.com/v4";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findFirst({
    where: { platform: "google", connected: true },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error("Google account not connected.");
  return account.accessToken;
}

export async function createGBPPost({
  locationId,
  summary,
  imageUrl,
  actionUrl,
  actionType = "LEARN_MORE",
}: {
  locationId: string;
  summary: string;
  imageUrl?: string;
  actionUrl: string;
  actionType?: string;
}) {
  const token = await getAccessToken();
  const res = await fetch(`${GBP_API}/${locationId}/localPosts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      languageCode: "en-US",
      summary,
      callToAction: { actionType, url: actionUrl },
      media: imageUrl ? [{ mediaFormat: "PHOTO", sourceUrl: imageUrl }] : undefined,
      topicType: "STANDARD",
    }),
  });
  if (!res.ok) throw new Error(`GBP API error (${res.status})`);
  return res.json() as Promise<{ name: string }>;
}
