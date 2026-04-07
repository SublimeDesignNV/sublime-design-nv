import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  await db.socialAccount.update({
    where: { platform: "facebook" },
    data: { connected: false, accountId: null, accountName: null, accessToken: null, refreshToken: null, tokenExpiry: null, connectedAt: null },
  });
  return Response.json({ ok: true });
}
