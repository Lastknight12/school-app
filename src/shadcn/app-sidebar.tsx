"use client";

import {
  Archive,
  ArrowLeftRight,
  AudioLines,
  Banknote,
  ChartColumnBig,
  ChartNoAxesColumn,
  Database,
  Home,
  Play,
  Rocket,
  School,
  Shield,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import NavMain from "~/shadcn/nav-main";

import { type getServerAuthSession } from "~/server/auth";

import { NavUser } from "./nav-user";

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
      name: "Admin",
      icon: Shield,
      isActive: true,
      isCollapsible: true,
      items: [
        {
          name: "Database",
          url: "/admin/db?tab=users",
          icon: Database,
          isCollapsible: true,
          items: [
            {
              name: "Користувачі",
              icon: Users,
              url: "/admin/db?tab=users",
            },
            {
              name: "Покупки",
              icon: ShoppingBag,
              url: "/admin/db?tab=purchases",
            },
            {
              name: "Перекази",
              icon: ArrowLeftRight,
              url: "/admin/db?tab=transactions",
            },
          ],
        },
      ],
    },
    {
      name: "Казна",
      url: "/admin/kazna",
      icon: Wallet,
    },
    { name: "Список класів", url: "/admin", icon: School },
    {
      name: "Переказ коштів",
      url: "/transactions",
      icon: Banknote,
    },
  ],

  radio_center: [
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

  main: [
    {
      name: "Головна",
      url: "/",
      icon: Home,
      allowedRoles: ["STUDENT", "TEACHER", "SELLER", "RADIO_CENTER", "ADMIN"],
    },
    {
      name: "Магазин",
      url: "/shop",
      icon: Store,
      allowedRoles: ["STUDENT", "RADIO_CENTER"],
    },
    {
      name: "Статистика",
      url: "/stats",
      icon: ChartColumnBig,
      allowedRoles: ["STUDENT", "RADIO_CENTER"],
    },
    {
      name: "Таблиця лідерів",
      url: "/leaderboard",
      icon: ChartNoAxesColumn,
      allowedRoles: ["STUDENT", "RADIO_CENTER", "ADMIN", "SELLER", "TEACHER"],
    },
    {
      name: "Замовити музику",
      url: "/music",
      icon: AudioLines,
      allowedRoles: ["STUDENT", "RADIO_CENTER"],
    },
  ],
};

interface Props {
  session: Awaited<ReturnType<typeof getServerAuthSession>>;
}

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
            <NavMain items={data.admin} label="Admin" />
            <SidebarSeparator />
          </>
        )}

        {session.user.role === "RADIO_CENTER" && (
          <>
            <NavMain items={data.radio_center} label="Radio Center" />
            <SidebarSeparator />
          </>
        )}

        {session.user && (
          <NavMain
            items={data.main.filter((item) =>
              item.allowedRoles.includes(session.user.role),
            )}
            label="Main"
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
