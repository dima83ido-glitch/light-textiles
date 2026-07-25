import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/demo-session-token";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE_NAME)?.value);

    if (!session && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (session && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|uploads|.*\\..*).*)",
  ],
};
