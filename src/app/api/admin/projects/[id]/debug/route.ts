import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { getProjectVisibilityDebug } from "@/lib/projectRecords.server";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  void request;

  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const debug = await getProjectVisibilityDebug(context.params.id);
  if (!debug) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    ...debug,
  });
}
