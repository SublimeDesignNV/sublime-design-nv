import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

const SINGLETON_ID = "settings-singleton";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  let settings = await db.businessSettings.findFirst();
  if (!settings) {
    settings = await db.businessSettings.create({ data: { id: SINGLETON_ID, updatedAt: new Date() } });
  }
  return Response.json(settings);
}

export async function PUT(req: Request) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Strip non-writable fields
  const { id: _id, updatedAt: _updatedAt, ...data } = body as Record<string, unknown>;
  void _id; void _updatedAt;

  const settings = await db.businessSettings.upsert({
    where: { id: SINGLETON_ID },
    update: { ...data, updatedAt: new Date() },
    create: { id: SINGLETON_ID, ...data, updatedAt: new Date() },
  });
  return Response.json(settings);
}
