"use server";

import { urls } from "~/middleware";
import { getServerAuthSession } from "~/server/auth";
import BottomNavigation from "./BottomNavigation";
import { cn } from "~/lib/utils";

interface Props {
  position?: "left" | "bottom";
}

export default async function BottomNavigationContainer({
  position = "bottom",
}: Props) {
  const session = await getServerAuthSession();

  if (session?.user.role === ("TEACHER" || "ADMIN") || !session) return null;

  const allowedUrls: string[] = [];
  // check allowed urls
  urls.forEach((value, url) => {
    if (value.includes(session.user.role)) return allowedUrls.push(url);
  });

  // if no allowed urls return null and render nothing
  if (!allowedUrls || allowedUrls.length <= 1) return null;

  return (
    <div
      className={cn(
        position === "left" && "top-1/2 -translate-y-1/2 left-0 items-center",
        position === "bottom" && "bottom-0 left-1/2 -translate-x-1/2 justify-center",
        "fixed flex z-50")}
    >
      <BottomNavigation allowedUrls={allowedUrls} position={position}/>
    </div>
  );
}
