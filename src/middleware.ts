import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";
import { env } from "./env";

// IMPORTANT: add url in matcher
export const urls = new Map<string, UserRole[]>([
  ["/", ["TEACHER", "SELLER", "STUDENT"]],
  ["/stats", ["STUDENT"]],
  ["/transactions", ["STUDENT"]],
  ["/shop", ["STUDENT"]],
  ["/buy", ["STUDENT"]],
  ["/settings", ["TEACHER", "ADMIN", "SELLER", "STUDENT"]],
  ["/leaderboard", ["ADMIN", "SELLER", "TEACHER", "STUDENT"]],
  ["/admin", ["ADMIN"]],
  ["/admin/klass/[klassName]", ["ADMIN"]],
  ["/admin/transfers", ["ADMIN"]],
]);

const not_found_url = "/404";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const cookieName = "__Secure-next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const decryptToken = (await decode({
    token,
    secret: env.NEXTAUTH_SECRET!,
  })) as unknown as Session["user"];

  const currentUrl = request.nextUrl.pathname;

  if (!urls.get(currentUrl)?.includes(decryptToken.role)) {
    return NextResponse.redirect(new URL(not_found_url, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/stats", "/transactions", "/shop", "/buy", "/admin", "/admin/klass/:klassName"],
};
