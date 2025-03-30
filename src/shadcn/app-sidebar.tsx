"use client";

import { type UserRole } from "@prisma/client";
import {
  Archive,
  AudioLines,
  ChartColumnBig,
  ChartNoAxesColumn,
  CircleDollarSign,
  Home,
  Play,
  Rocket,
  Shield,
  Store,
  Table,
  Wallet,
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

const data = {
  admin: [
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
      isActive: true,
      isCollapsible: true,
      items: [
        {
          name: "Database",
          url: "/admin/db?tab=users",
          subItems: [
            {
              name: "Користувачі",
              url: "/admin/db?tab=users",
            },
            {
              name: "Покупки",
              url: "/admin/db?tab=purchases",
            },
            {
              name: "Перекази",
              url: "/admin/db?tab=transactions",
            },
          ],
        },
      ],
    },
    {
      title: "Казна",
      url: "/admin/kazna",
      icon: Wallet,
      isCollapsible: false,
    },
    {
      title: "Переказ коштів",
      url: "/transactions",
      icon: CircleDollarSign,
      isCollapsible: false,
    },
  ],

  seller: [{ name: "Покупки", url: "/seller/purchases", icon: Table }],

  radioCenter: [
    {
      name: "Замовлення",
      url: "/musicOrders",
      icon: Archive,
    },
    {
      name: "Плеєр",
      url: "/music/player",
      icon: Play,
    },
  ],

  navMain: [
    { name: "Головна", url: "/", icon: Home },
    {
      name: "Магазин",
      url: "/shop",
      icon: Store,
    },
    {
      name: "Статистика",
      url: "/stats",
      icon: ChartColumnBig,
    },
    {
      name: "Таблиця лідерів",
      url: "/leaderboard",
      icon: ChartNoAxesColumn,
    },
    { name: "Замовити музику", url: "/music", icon: AudioLines },
  ],
};

interface Props {
  session: Session | null;
}

const routesWithAuth = new Map<string, UserRole[]>([
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
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

        {session.user.role === "RADIO_CENTER" && (
          <>
            <SidebarSeparator />
            <NavMain items={data.radioCenter} label="Radio Center" />
            <SidebarSeparator />
          </>
        )}

        {session.user.role === "SELLER" && (
          <>
            <SidebarSeparator />
            <NavMain items={data.seller} label="Seller" />
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
