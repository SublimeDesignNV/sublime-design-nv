import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPinterestBoard, syncPinterestBoards } from "@/lib/social/pinterest";

export async function GET() {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const boards = await db.pinterestBoard.findMany({ orderBy: { name: "asc" } });
  return Response.json({ boards });
}

export async function POST(req: Request) {
  if (!(await requireAdminApiSession())) return unauthorizedResponse();

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    name?: string;
    description?: string;
    serviceType?: string;
    area?: string;
  };

  // Sync from Pinterest API
  if (body.action === "sync") {
    try {
      const count = await syncPinterestBoards();
      return Response.json({ ok: true, synced: count });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed.";
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }

  // Create new board
  if (!body.name?.trim()) {
    return Response.json({ ok: false, error: "name is required." }, { status: 400 });
  }

  try {
    const apiBoard = await createPinterestBoard(body.name.trim(), body.description?.trim() ?? "");
    const board = await db.pinterestBoard.create({
      data: {
        boardId: (apiBoard as { id?: string }).id ?? body.name.trim(),
        name: body.name.trim(),
        description: body.description?.trim() ?? null,
        serviceType: body.serviceType ?? null,
        area: body.area ?? null,
        updatedAt: new Date(),
      },
    });
    return Response.json({ ok: true, board }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create board.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
