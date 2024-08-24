import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";
import { env } from "./env";

export const urls = new Map<string, UserRole[]>([
  ["/stats", ["STUDENT"]],
  ["/transactions", ["STUDENT"]],
]);
const redirectUrl = "/not-found";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const cookieName =
    process.env.NODE_ENV === "development"
      ? "next-auth.session-token"
      : "__Secure-next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const decryptToken = (await decode({
    token,
    secret: env.NEXTAUTH_SECRET!,
  })) as unknown as Session["user"];

  const currentUrl = request.nextUrl.pathname;

  if (!urls.get(currentUrl)?.includes(decryptToken.role)) {
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/stats", "/transactions", "/settings"],
};
