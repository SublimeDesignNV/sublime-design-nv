import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

const PLATFORMS = ["instagram", "facebook", "pinterest", "youtube"] as const;

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  // Ensure rows exist for all platforms
  await Promise.all(
    PLATFORMS.map((platform) =>
      db.socialAccount.upsert({
        where: { platform },
        create: { platform, updatedAt: new Date() },
        update: {},
      })
    )
  );

  const accounts = await db.socialAccount.findMany({
    orderBy: { platform: "asc" },
    select: {
      id: true,
      platform: true,
      accountId: true,
      accountName: true,
      connected: true,
      connectedAt: true,
    },
  });

  return Response.json({ accounts });
}
