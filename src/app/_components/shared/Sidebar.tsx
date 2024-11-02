"use client";

import { type Session } from "next-auth";
import { usePathname } from "next/navigation";
import { AppSidebar } from "~/shadcn/app-sidebar";
import SidebarPath from "~/shadcn/sidebat-inset";

import { SidebarProvider } from "~/shadcn/ui/sidebar";

interface Props {
  children: React.ReactNode;
  session: Session | null;
}

const mainUrls = [
  { url: "/stats", allowedRoles: ["STUDENT", "RADIO_CENTER"] },
  { url: "/transactions", allowedRoles: ["ADMIN"] },
  { url: "/shop", allowedRoles: ["STUDENT", "RADIO_CENTER"] },
  {
    url: "/leaderboard",
    allowedRoles: ["STUDENT", "RADIO_CENTER", "ADMIN", "SELLER", "TEACHER"],
  },
];

const dontRenderUrls = ["/login"];

export default function Sidebar({ children, session }: Props) {
  const pathname = usePathname();

  if (dontRenderUrls.includes(pathname)) return children;

  const allowedMainUrls = mainUrls.filter((url) =>
    session ? url.allowedRoles.includes(session.user.role) : false,
  );

  return (
    <SidebarProvider>
      <AppSidebar
        session={session}
        showAdmin={session ? session.user.role === "ADMIN" : false}
        allowedMainUrls={allowedMainUrls.map((url) => url.url)}
      />

      <SidebarPath>{children}</SidebarPath>
    </SidebarProvider>
  );
}
