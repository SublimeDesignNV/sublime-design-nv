import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/adminAuth";
import { db } from "@/lib/db";

type PublishBody = {
  published?: boolean;
};

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as PublishBody;
  if (typeof body.published !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "published must be a boolean." },
      { status: 400 },
    );
  }

  const id = context.params.id;

  try {
    const asset = await db.asset.update({
      where: { id },
      data: { published: body.published },
      select: {
        id: true,
        published: true,
      },
    });
    return NextResponse.json({ ok: true, asset });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Asset not found." },
      { status: 404 },
    );
  }
}
