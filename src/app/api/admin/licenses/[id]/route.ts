import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const { id: _id, createdAt: _c, updatedAt: _u, ...data } = body;
  void _id; void _c; void _u;

  if (data.expiresAt && typeof data.expiresAt === "string") {
    (data as Record<string, unknown>).expiresAt = new Date(data.expiresAt);
  }

  const license = await db.contractorLicense.update({ where: { id }, data });
  return Response.json(license);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const { id } = await params;
  await db.contractorLicense.delete({ where: { id } });
  return Response.json({ ok: true });
}
