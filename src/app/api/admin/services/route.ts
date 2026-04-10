import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const services = await db.serviceType.findMany({
    where: { tagType: "SERVICE" },
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true, coverImage: true },
  });
  return Response.json(services);
}
