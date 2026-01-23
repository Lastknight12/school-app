"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "~/shadcn/app-sidebar";
import SidebarPath from "~/shadcn/sidebar-path";

import { type getServerAuthSession } from "~/server/auth";

import { SidebarInset, SidebarProvider } from "~/shadcn/ui/sidebar";

interface Props {
  children: React.ReactNode;
  session: Awaited<ReturnType<typeof getServerAuthSession>> | null;
}
const dontRenderUrls = ["/login"];

export default function Sidebar({ children, session }: Props) {
  const pathname = usePathname();

  if (dontRenderUrls.includes(pathname)) return children;

  return (
    <SidebarProvider>
      <AppSidebar session={session} />

      <SidebarInset>
        {session && (
          <SidebarPath
            showQrScanner={
              session.user.role === "STUDENT" ||
              session.user.role === "RADIO_CENTER"
            }
          />
        )}

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
