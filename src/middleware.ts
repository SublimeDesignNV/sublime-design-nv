import { NextResponse } from "next/server";
import { auth, isAllowedAdminEmail, normalizeAdminNextPath } from "@/lib/auth";

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAllowedUser = isAllowedAdminEmail(request.auth?.user?.email);

  if (!isAdminPath) {
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
    loginUrl.searchParams.set(
      "next",
      normalizeAdminNextPath(`${pathname}${nextUrl.search}`),
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
