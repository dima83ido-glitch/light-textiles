import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

const intlMiddleware = createMiddleware(routing);

// Path-prefix -> roles allowed to access it. Unlisted /admin paths are open to any signed-in role.
const ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin/users", roles: ["OWNER"] },
  { prefix: "/admin/warehouses", roles: ["OWNER", "MANAGER", "WAREHOUSE"] },
];

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
    if (session) {
      const restricted = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
      if (restricted && !restricted.roles.includes(session.role)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
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
