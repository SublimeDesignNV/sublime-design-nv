import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApiSession, unauthorizedResponse } from "@/lib/auth";
import { backfillProjectRecords } from "@/lib/projectRecords.server";

type BackfillBody = {
  autoCreateDrafts?: boolean;
};

export async function POST(request: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return unauthorizedResponse();
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as BackfillBody;
  const summary = await backfillProjectRecords({
    autoCreateDrafts: Boolean(body.autoCreateDrafts),
  });

  return NextResponse.json({
    ok: true,
    summary,
  });
}
