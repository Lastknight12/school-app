"use server";

import { urls } from "~/middleware";
import { getServerAuthSession } from "~/server/auth";
import BottomNavigation from "./BottomNavigation";

export default async function BottomNavigationContainer() {
  const session = await getServerAuthSession();

  if (session?.user.role === ("TEACHER" || "ADMIN") || !session) return null;

  const allowedUrls: string[] = [];
  // check allowed urls
  urls.forEach((value, url) => {
    if (value.includes(session.user.role)) return allowedUrls.push(url);
  });

  // if no allowed urls return null and render nothing
  if (!allowedUrls || allowedUrls.length <= 1) return null;

  return <BottomNavigation allowedUrls={allowedUrls} />;
}
