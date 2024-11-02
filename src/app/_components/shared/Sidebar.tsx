"use client";

import { type UserRole } from "@prisma/client";
import { type Session } from "next-auth";
import { usePathname } from "next/navigation";
import { AppSidebar } from "~/shadcn/app-sidebar";
import SidebarPath from "~/shadcn/sidebar-path";

import { SidebarInset, SidebarProvider } from "~/shadcn/ui/sidebar";

interface Props {
  children: React.ReactNode;
  session: Session | null;
}

const routesWithAuth = new Map<string, UserRole[]>([
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
  ["/transactions", ["ADMIN"]],
  ["/shop", ["STUDENT", "RADIO_CENTER"]],
  ["/leaderboard", ["STUDENT", "RADIO_CENTER", "ADMIN", "SELLER", "TEACHER"]],
]);
const dontRenderUrls = ["/login"];

export default function Sidebar({ children, session }: Props) {
  const pathname = usePathname();

  if (dontRenderUrls.includes(pathname)) return children;

  return (
    <SidebarProvider>
      <AppSidebar
        session={session}
        showAdmin={session ? session.user.role === "ADMIN" : false}
        routesWithAuth={routesWithAuth}
      />

      <SidebarInset>
        <SidebarPath />

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
