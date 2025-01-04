"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/shadcn/ui/sidebar";

export function NavMain({
  items,
  label
}: {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  label?: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label ?? "Main"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.name} mobCloseOnSelect>
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
