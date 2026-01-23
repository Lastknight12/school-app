"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "~/shadcn/app-sidebar";
import SidebarPath from "~/shadcn/sidebar-path";

import { type authClient } from "~/lib/auht-client";

import { SidebarInset, SidebarProvider } from "~/shadcn/ui/sidebar";

interface Props {
  children: React.ReactNode;
  session: typeof authClient.$Infer.Session | null;
  sessions: (typeof authClient.$Infer.Session)[];
}
const dontRenderUrls = ["/login"];

export default function Sidebar({ children, session, sessions }: Props) {
  const pathname = usePathname();

  if (dontRenderUrls.includes(pathname)) return children;

  return (
    <SidebarProvider>
      <AppSidebar session={session} sessions={sessions} />

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
