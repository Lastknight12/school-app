"use server";

import { urls } from "~/middleware";
import { getServerAuthSession } from "~/server/auth";
import BottomNavigation from "./BottomNavigation";

export default async function BottomNavigationContainer() {
  const session = await getServerAuthSession();

  if (session?.user.role === ("TEACHER" || "ADMIN") || !session) return null;

  const allowedUrls: string[] = [];
  urls.forEach((value, url) => {
    if (value.includes(session.user.role)) return allowedUrls.push(url);
  });

  if (!allowedUrls) return null;

  return <BottomNavigation allowedUrls={allowedUrls} />;
}
