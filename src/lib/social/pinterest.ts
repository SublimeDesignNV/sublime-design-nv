import { db } from "@/lib/db";
import { assertSocialEnabled } from "./config";

const PINTEREST_API = "https://api.pinterest.com/v5";

async function getAccessToken(): Promise<string> {
  const account = await db.socialAccount.findFirst({
    where: { platform: "pinterest", connected: true },
    select: { accessToken: true },
  });
  if (!account?.accessToken) throw new Error("Pinterest not connected. Go to Social → Settings to connect.");
  return account.accessToken;
}

export async function getPinterestBoards() {
  assertSocialEnabled("pinterest");
  const token = await getAccessToken();
  const res = await fetch(`${PINTEREST_API}/boards?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Pinterest API error (${res.status})`);
  return res.json() as Promise<{ items?: PinterestBoardData[] }>;
}

export async function createPinterestBoard(name: string, description: string) {
  assertSocialEnabled("pinterest");
  const token = await getAccessToken();
  const res = await fetch(`${PINTEREST_API}/boards`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, privacy: "PUBLIC" }),
  });
  if (!res.ok) throw new Error(`Pinterest API error (${res.status})`);
  return res.json() as Promise<PinterestBoardData>;
}

export async function createPin({
  boardId,
  title,
  description,
  imageUrl,
  link,
  altText,
}: {
  boardId: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  altText?: string;
}) {
  assertSocialEnabled("pinterest");
  const token = await getAccessToken();
  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      board_id: boardId,
      title,
      description,
      link,
      alt_text: altText ?? title,
      media_source: { source_type: "image_url", url: imageUrl },
    }),
  });
  if (!res.ok) throw new Error(`Pinterest API error (${res.status})`);
  return res.json() as Promise<{ id?: string; error?: { message: string } }>;
}

type PinterestBoardData = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  pin_count?: number;
};

export async function syncPinterestBoards(): Promise<number> {
  assertSocialEnabled("pinterest");
  const data = await getPinterestBoards();
  const boards = data.items ?? [];

  for (const board of boards) {
    await db.pinterestBoard.upsert({
      where: { boardId: board.id },
      update: {
        name: board.name,
        description: board.description ?? null,
        url: board.url ?? null,
        pinCount: board.pin_count ?? 0,
        updatedAt: new Date(),
      },
      create: {
        boardId: board.id,
        name: board.name,
        description: board.description ?? null,
        url: board.url ?? null,
        pinCount: board.pin_count ?? 0,
        updatedAt: new Date(),
      },
    });
  }

  return boards.length;
}
