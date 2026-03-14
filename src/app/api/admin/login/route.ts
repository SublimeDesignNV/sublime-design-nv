import { NextResponse } from "next/server";
import {
  isAdminAuthConfigured,
  normalizeAdminNextPath,
  setAdminCookie,
  verifyAdminPassword,
} from "@/lib/adminAuth";

type LoginRequestBody = {
  password?: string;
  nextPath?: string;
};

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin auth is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as LoginRequestBody;
  const password = body.password?.trim() || "";
  const nextPath = normalizeAdminNextPath(body.nextPath);

  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Invalid admin password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, redirectTo: nextPath });
  setAdminCookie(response);
  return response;
}
