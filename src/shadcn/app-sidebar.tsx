"use client";

import {
  ChartColumnBig,
  ChartNoAxesColumn,
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
  ],
};

interface Props {
  session: Session | null;
  showAdmin: boolean;
  allowedMainUrls?: string[];
}

export function AppSidebar({
  session,
  showAdmin,
  allowedMainUrls = [],
}: Props & React.ComponentProps<typeof Sidebar>) {
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
        {showAdmin && <NavAdmin items={data.admin} />}

        <NavMain
          routes={data.navMain.filter((item) =>
            allowedMainUrls.includes(item.url),
          )}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session ? session.user : null} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
