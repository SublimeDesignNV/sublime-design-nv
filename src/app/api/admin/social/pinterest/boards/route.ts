import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const account = await db.socialAccount.findUnique({ where: { platform: "pinterest" } });
  if (!account?.connected || !account.accessToken) {
    return Response.json({ boards: [] });
  }

  const res = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
    headers: { Authorization: `Bearer ${account.accessToken}` },
  });
  if (!res.ok) return Response.json({ boards: [] });

  const data = (await res.json()) as { items?: Array<{ id: string; name: string }> };
  return Response.json({ boards: data.items ?? [] });
}
