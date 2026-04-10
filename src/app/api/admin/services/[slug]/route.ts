import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as { coverImage?: string };

  if (!body.coverImage) {
    return Response.json({ error: "coverImage required" }, { status: 400 });
  }

  const service = await db.serviceType.update({
    where: { slug_tagType: { slug, tagType: "SERVICE" } },
    data: { coverImage: body.coverImage },
  });

  return Response.json(service);
}
