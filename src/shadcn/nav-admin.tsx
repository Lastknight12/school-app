"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

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

export function NavAdmin({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isCollapsible?: boolean;
    items?: {
      name: string;
      url: string;
      subItems?: {
        name: string;
        url: string;
      }[];
    }[];
  }[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <>
            {item.isCollapsible ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} mobCloseOnSelect>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <div key={subItem.url}>
                          {subItem.subItems ? (
                            <Collapsible
                              asChild
                              className="group/subcollapsible"
                            >
                              <SidebarMenuSubItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton className="cursor-pointer">
                                    <span>{subItem.name}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {subItem.subItems?.map((subSubItem) => (
                                      <SidebarMenuSubItem key={subSubItem.name}>
                                        <SidebarMenuSubButton
                                          asChild
                                          onClick={() =>
                                            isMobile && setOpenMobile(false)
                                          }
                                        >
                                          <Link href={subSubItem.url}>
                                            <span>{subSubItem.name}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </SidebarMenuSubItem>
                            </Collapsible>
                          ) : (
                            <SidebarMenuSubItem key={subItem.name}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  href={subItem.url}
                                  onClick={() =>
                                    isMobile && setOpenMobile(false)
                                  }
                                >
                                  <span>{subItem.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </div>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} mobCloseOnSelect>
                  <Link href={item.url}>
                  {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
