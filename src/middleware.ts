import type { UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "./env";

export const urls = new Map<string, UserRole[]>([
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
  ["/transactions", ["ADMIN", "STUDENT"]],
  ["/shop", ["STUDENT", "RADIO_CENTER"]],
  ["/buy", ["STUDENT", "SELLER"]],
  ["/admin", ["ADMIN"]],
  ["/admin/db", ["ADMIN"]],
  ["/musicOrders", ["RADIO_CENTER"]],
  ["/music/player", ["RADIO_CENTER"]],
]);

const not_found_url = "/404";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const cookieName = "__Secure-next-auth.session-token";
  const token = request.cookies.get(cookieName)?.value;
  const currentUrl = request.nextUrl.pathname;

  // find url that match regex or equal current url
  const urlMatch = Array.from(urls.entries()).find(([url]) =>
    RegExp(url).test(currentUrl) ? true : currentUrl === url
  );

  if (!urlMatch) {
    return;
  }

  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  const decryptedToken = (await decode({
    token,
    secret: env.NEXTAUTH_SECRET!,
  })) as unknown as Session["user"];

  if (!urlMatch[1].includes(decryptedToken.role)) {
    return NextResponse.redirect(new URL(not_found_url, request.url));
  }
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
    "/admin/klass/:klassName",
    "/musicOrders",
    "/music/player",
  ],
};
