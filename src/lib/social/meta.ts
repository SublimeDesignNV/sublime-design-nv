import { assertSocialEnabled } from "./config";

const GRAPH_URL = "https://graph.facebook.com/v19.0";

type MetaApiResponse = { id?: string; error?: { message: string; code: number } };

async function graphPost(endpoint: string, body: Record<string, string>): Promise<MetaApiResponse> {
  const res = await fetch(`${GRAPH_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<MetaApiResponse>;
}

export async function createInstagramContainer(imageUrl: string, caption: string) {
  assertSocialEnabled("instagram");
  return graphPost(`${process.env.INSTAGRAM_ACCOUNT_ID}/media`, {
    image_url: imageUrl,
    caption,
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
  });
}

export async function publishInstagramContainer(containerId: string) {
  assertSocialEnabled("instagram");
  return graphPost(`${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`, {
    creation_id: containerId,
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
  });
}

export async function publishInstagramCarousel(imageUrls: string[], caption: string) {
  assertSocialEnabled("instagram");

  // 1. Create a child container for each image
  const children: string[] = [];
  for (const url of imageUrls) {
    const child = await graphPost(`${process.env.INSTAGRAM_ACCOUNT_ID}/media`, {
      image_url: url,
      is_carousel_item: "true",
      access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
    });
    if (!child.id) throw new Error(`Failed to create carousel item: ${child.error?.message ?? "unknown"}`);
    children.push(child.id);
  }

  // 2. Create carousel container
  const carousel = await graphPost(`${process.env.INSTAGRAM_ACCOUNT_ID}/media`, {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption,
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
  });
  if (!carousel.id) throw new Error(`Failed to create carousel: ${carousel.error?.message ?? "unknown"}`);

  // 3. Publish
  return publishInstagramContainer(carousel.id);
}

export async function postToFacebook(message: string, imageUrl?: string) {
  assertSocialEnabled("facebook");
  const body: Record<string, string> = {
    message,
    access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN!,
  };
  if (imageUrl) body.url = imageUrl;
  const endpoint = imageUrl ? "photos" : "feed";
  return graphPost(`${process.env.FACEBOOK_PAGE_ID}/${endpoint}`, body);
}
