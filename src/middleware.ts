import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "~/env";

export const urls = new Map<string | RegExp, UserRole[]>([
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
  ["/transactions", ["ADMIN"]],
  ["/shop", ["STUDENT", "RADIO_CENTER"]],
  ["/buy", ["STUDENT"]],
  ["/admin", ["ADMIN"]],
  ["/admin/db", ["ADMIN"]],
  ["/admin/kazna", ["ADMIN"]],
  ["/musicOrders", ["RADIO_CENTER"]],
  ["/music/player", ["RADIO_CENTER"]],
  [/^\/admin\/klass\/.*/, ["ADMIN"]],
]);

const not_found_url = "/404";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const cookieName =
    process.env.NODE_ENV === "development"
      ? "next-auth.session-token"
      : "__Secure-next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;
  const { pathname } = request.nextUrl;

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const decryptedToken = (await decode({
    token,
    secret: env.NEXTAUTH_SECRET!,
  })) as unknown as Session["user"];

  const hasAccess = (
    allowedRoles: string[],
    pattern: string | RegExp,
  ): boolean => {
    if (typeof pattern === "string") {
      return pattern === pathname && allowedRoles.includes(decryptedToken.role);
    }
    if (pattern instanceof RegExp) {
      return (
        pattern.test(pathname) && allowedRoles.includes(decryptedToken.role)
      );
    }
    return false;
  };

  const hasValidRoute = Array.from(urls).some(([pattern, allowedRoles]) => {
    if (hasAccess(allowedRoles, pattern)) {
      return true;
    }
    return false;
  });

  if (hasValidRoute) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(not_found_url, request.url));
}

// See "Matching Paths" below to learn more
// add url if you want to allow only some role visit this url
export const config = {
  matcher: [
    "/stats",
    "/transactions",
    "/shop",
    "/buy",
    "/admin/db",
    "/admin",
    "/admin/kazna",
    "/admin/klass/:path*",
  ],
};
