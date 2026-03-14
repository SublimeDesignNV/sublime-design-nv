import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 14;

type ParsedScryptHash = {
  N: number;
  r: number;
  p: number;
  salt: string;
  derivedKeyHex: string;
};

function getConfiguredAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

function getLegacyAdminToken() {
  return process.env.ADMIN_TOKEN?.trim() || null;
}

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    getConfiguredAdminPasswordHash() ||
    getLegacyAdminToken() ||
    ""
  );
}

function bufferFromString(value: string) {
  return Buffer.from(value, "utf8");
}

function constantTimeEqualStrings(a: string, b: string) {
  const left = bufferFromString(a);
  const right = bufferFromString(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function parseScryptHash(hash: string): ParsedScryptHash | null {
  const [algorithm, nValue, rValue, pValue, salt, derivedKeyHex] = hash.split("$");
  if (algorithm !== "scrypt" || !nValue || !rValue || !pValue || !salt || !derivedKeyHex) {
    return null;
  }

  const N = Number.parseInt(nValue, 10);
  const r = Number.parseInt(rValue, 10);
  const p = Number.parseInt(pValue, 10);

  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return null;
  }

  return { N, r, p, salt, derivedKeyHex };
}

function verifyScryptHash(password: string, hash: string) {
  const parsed = parseScryptHash(hash);
  if (!parsed) return false;

  const expected = Buffer.from(parsed.derivedKeyHex, "hex");
  if (!expected.length) return false;

  const derived = scryptSync(password, parsed.salt, expected.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
    maxmem: 128 * parsed.N * parsed.r + 1024,
  });

  return timingSafeEqual(derived, expected);
}

function signSessionPayload(payload: string) {
  const secret = getAdminSessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSessionValue() {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const signature = signSessionPayload(payload);
  return `${payload}.${signature}`;
}

function readSessionExpiration(value: string | undefined | null) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = signSessionPayload(payload);
  if (!expected) return null;
  if (!constantTimeEqualStrings(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    if (!parsed.exp || parsed.exp <= Date.now()) {
      return null;
    }
    return parsed.exp;
  } catch {
    return null;
  }
}

export function normalizeAdminNextPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin";
  }
  return nextPath;
}

export function isAdminAuthConfigured() {
  return Boolean(getConfiguredAdminPasswordHash() || getLegacyAdminToken());
}

export function verifyAdminPassword(password: string) {
  const configuredHash = getConfiguredAdminPasswordHash();
  if (configuredHash) {
    return verifyScryptHash(password, configuredHash);
  }

  const legacyToken = getLegacyAdminToken();
  if (!legacyToken) return false;
  return constantTimeEqualStrings(password, legacyToken);
}

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(readSessionExpiration(token));
}

export function isAdminSession() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(readSessionExpiration(token));
}

export function requireAdmin(nextPath = "/admin") {
  if (!isAdminSession()) {
    redirect(`/admin/login?next=${encodeURIComponent(normalizeAdminNextPath(nextPath))}`);
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
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
