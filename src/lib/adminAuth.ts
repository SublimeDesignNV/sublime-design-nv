import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_token";

function getConfiguredAdminToken() {
  return process.env.ADMIN_TOKEN;
}

export function isAdminTokenValid(token: string | undefined | null) {
  const expected = getConfiguredAdminToken();
  return Boolean(expected && token && token === expected);
}

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isAdminTokenValid(token);
}

export function isAdminSession() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return isAdminTokenValid(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
