import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const { boardId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    serviceType?: string | null;
    area?: string | null;
    isDefault?: boolean;
    name?: string;
    description?: string;
  };

  const board = await db.pinterestBoard.update({
    where: { boardId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.serviceType !== undefined && { serviceType: body.serviceType }),
      ...(body.area !== undefined && { area: body.area }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      updatedAt: new Date(),
    },
  });

  return Response.json({ ok: true, board });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const { boardId } = await params;
  await db.pinterestBoard.delete({ where: { boardId } });
  return Response.json({ ok: true });
}
