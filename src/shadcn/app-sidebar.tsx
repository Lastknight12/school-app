"use client";

import { type UserRole } from "@prisma/client";
import {
  Archive,
  AudioLines,
  ChartColumnBig,
  ChartNoAxesColumn,
  Home,
  Play,
  Rocket,
  Shield,
  Store,
} from "lucide-react";
import { type Session } from "next-auth";
import * as React from "react";
import { NavAdmin } from "~/shadcn/nav-admin";
import { NavMain } from "~/shadcn/nav-main";
import { NavUser } from "~/shadcn/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "~/shadcn/ui/sidebar";

// This is sample data.
const data = {
  admin: [
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
      isActive: true,
      items: [
        {
          name: "Database",
          url: "/admin/db?tab=users",
          subItems: [
            {
              name: "Users",
              url: "/admin/db?tab=users",
            },
            {
              name: "Badges",
              url: "/admin/db?tab=badges",
            },
            {
              name: "Transactions",
              url: "/admin/db?tab=transactions",
            },
          ],
        },
      ],
    },
  ],
  navMain: [
    { name: "Home", url: "/", icon: Home },
    {
      name: "Products list",
      url: "/shop",
      icon: Store,
    },
    {
      name: "Stats",
      url: "/stats",
      icon: ChartColumnBig,
    },
    {
      name: "Leaderboard",
      url: "/leaderboard",
      icon: ChartNoAxesColumn,
    },
    { name: "Order music", url: "/music", icon: AudioLines },
  ],
  radioCenter: [
    {
      name: "Music Orders",
      url: "/musicOrders",
      icon: Archive,
    },
    {
      name: "Music Player",
      url: "/music/player",
      icon: Play,
    },
  ],
};

interface Props {
  session: Session | null;
}

const routesWithAuth = new Map<string, UserRole[]>([
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
  ["/transactions", ["ADMIN"]],
  ["/shop", ["STUDENT", "RADIO_CENTER"]],
  ["/leaderboard", ["STUDENT", "RADIO_CENTER", "ADMIN", "SELLER", "TEACHER"]],
]);

export function AppSidebar({
  session,
}: Props & React.ComponentProps<typeof Sidebar>) {
  if (!session) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex aspect-square items-center justify-center bg-black rounded p-2">
            <Rocket className="size-4" fill="#fff" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">school-app</span>
            <span className="truncate text-xs">dev: LastKnight12</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {session.user.role === "ADMIN" && (
          <>
            <NavAdmin items={data.admin} />
            <SidebarSeparator />
          </>
        )}

        {session.user && (
          <NavMain
            items={data.navMain.filter((item) => {
              const allowedRoles = routesWithAuth.get(item.url) ?? [];

              if (
                allowedRoles.includes(session?.user.role) ||
                !routesWithAuth.has(item.url)
              )
                return true;
            })}
          />
        )}

        {session.user.role === "RADIO_CENTER" && (
          <>
            <SidebarSeparator />
            <NavMain items={data.radioCenter} label="Radio Center" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
