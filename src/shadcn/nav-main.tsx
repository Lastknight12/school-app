"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/shadcn/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/shadcn/ui/sidebar";

export interface Item {
  name: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  isCollapsible?: boolean;
  items?: Item[];
}

function recursiveItems(items: Item[]): ReactNode[] {
  return items.map((item) => {
    return item.isCollapsible ? (
      <Collapsible key={item.name} defaultOpen={item.isActive}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            {item.icon && <item.icon />}
            <span>{item.name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>{recursiveItems(item.items ?? [])}</SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    ) : (
      <SidebarMenuSubItem key={item.name}>
        <SidebarMenuSubButton asChild>
          <Link href={item.url ?? "#"}>
            {item.icon && <item.icon />}
            <span>{item.name}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  });
}

export default function NavMain({
  items,
  label,
}: {
  items: Item[];
  label?: string;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          return item.isCollapsible ? (
            recursiveItems([item])
          ) : (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url ?? "#"}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
