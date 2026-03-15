import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

function getAllowedAdminEmails() {
  return new Set(
    (process.env.ADMIN_ALLOWED_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  return getAllowedAdminEmails().has(email.trim().toLowerCase());
}

export function normalizeAdminNextPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin";
  }

  return nextPath;
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.AUTH_SECRET?.trim() &&
      process.env.AUTH_GOOGLE_ID?.trim() &&
      process.env.AUTH_GOOGLE_SECRET?.trim() &&
      getAllowedAdminEmails().size > 0,
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!isAllowedAdminEmail(user.email)) {
        return "/admin/login?error=AccessDenied";
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email) token.email = user.email;
      if (user?.name) token.name = user.name;
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }

        if (typeof token.name === "string") {
          session.user.name = token.name;
        }

        (session.user as typeof session.user & { provider?: string }).provider =
          typeof token.provider === "string" ? token.provider : undefined;
      }

      return session;
    },
  },
});

export async function isAdminSession() {
  const session = await auth();
  return Boolean(session?.user?.email && isAllowedAdminEmail(session.user.email));
}

export async function requireAdmin(nextPath = "/admin") {
  const session = await auth();

  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    const { redirect } = await import("next/navigation");
    redirect(`/admin/login?next=${encodeURIComponent(normalizeAdminNextPath(nextPath))}`);
  }

  return session;
}

export async function requireAdminApiSession() {
  const session = await auth();
  if (!session?.user?.email || !isAllowedAdminEmail(session.user.email)) {
    return null;
  }

  return session;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}
