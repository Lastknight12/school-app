import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "./env";

// IMPORTANT: add url in matcher without regex if url used in burger menu
export const urls = new Map<string, UserRole[]>([
  ["/", ["TEACHER", "ADMIN", "SELLER", "STUDENT"]],
  ["/stats", ["STUDENT"]],
  ["/transactions", ["ADMIN"]],
  ["/shop", ["STUDENT"]],
  ["/buy", ["STUDENT"]],
  ["/settings", ["TEACHER", "ADMIN", "SELLER", "STUDENT"]],
  ["^/klass/[^/]+$", ["TEACHER"]],
  ["/leaderboard", ["ADMIN", "SELLER", "TEACHER", "STUDENT"]],
  ["/admin", ["ADMIN"]],
  ["/admin/transfers", ["ADMIN"]],
]);

const not_found_url = "/404";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const cookieName = "__Secure-next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const decryptedToken = (await decode({
    token,
    secret: env.NEXTAUTH_SECRET!,
  })) as unknown as Session["user"];

  const currentUrl = request.nextUrl.pathname;

  // find url that match regex or equal current url
  const urlMatch = Array.from(urls.entries()).find(([url]) =>
    RegExp(url).test(currentUrl) ? true : currentUrl === url,
  );

  if (!urlMatch) {
    return;
  }

  if (!urlMatch[1].includes(decryptedToken.role)) {
    return NextResponse.redirect(new URL(not_found_url, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/stats",
    "/transactions",
    "/shop",
    "/buy",
    "/admin",
    "/admin/klass/:klassName",
  ],
};
