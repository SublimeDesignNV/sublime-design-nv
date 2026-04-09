import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();
  const body = (await req.json().catch(() => ({}))) as { ids?: string[] };
  if (!Array.isArray(body.ids)) {
    return Response.json({ error: "ids array required" }, { status: 400 });
  }
  await db.$transaction(
    body.ids.map((id, position) =>
      db.contractorLicense.update({ where: { id }, data: { position } })
    )
  );
  return Response.json({ ok: true });
}
