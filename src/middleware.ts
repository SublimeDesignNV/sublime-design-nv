import { NextResponse } from "next/server";
import { auth, isAllowedAdminEmail, normalizeAdminNextPath } from "@/lib/auth";

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isProtectedPath = isAdminPath || isDashboardPath;
  const isLoginPage = pathname === "/admin/login";
  const isAllowedUser = isAllowedAdminEmail(request.auth?.user?.email);

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  if (isLoginPage) {
    if (isAllowedUser) {
      const destination = normalizeAdminNextPath(nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(destination, nextUrl));
    }

    return NextResponse.next();
  }

  if (!isAllowedUser) {
    const loginUrl = new URL("/admin/login", nextUrl);
    const nextPath = `${pathname}${nextUrl.search}`;
    loginUrl.searchParams.set(
      "next",
      nextPath.startsWith("/admin") ? normalizeAdminNextPath(nextPath) : nextPath,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
