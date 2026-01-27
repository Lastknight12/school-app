"use client";

import { ChevronsUpDown, Loader2, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "~/lib/auht-client";

import { TruncatedText } from "~/app/_components/shared/TruncatedText";

import { Avatar, AvatarFallback, AvatarImage } from "~/shadcn/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/shadcn/ui/sidebar";

function Account({
  email,
  image,
  name,
  token,
}: {
  image: string;
  name: string;
  email: string;
  token?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
      onClick={async () => {
        await (token &&
          authClient.multiSession.setActive({ sessionToken: token }));
        window.location.reload();
      }}
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback className="rounded-lg">{name[0]}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <TruncatedText
          type="hover"
          className="truncate font-semibold"
          text={name}
          maxLength={20}
        />
        <span className="truncate text-xs">{email}</span>
      </div>
    </div>
  );
}

export function SidebarUser({
  user,
  sessions,
}: {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  sessions: (typeof authClient.$Infer.Session)[];
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image ?? ""} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Account
                    name={user.name}
                    image={user.image ?? ""}
                    email={user.email}
                  />
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {sessions.map((data) => (
                      <DropdownMenuItem key={data.user.email}>
                        <Account
                          name={data?.user.name ?? ""}
                          image={data?.user.image ?? ""}
                          email={data?.user.email ?? ""}
                          token={data.session.token}
                        />
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() =>
                        authClient.signIn.social({ provider: "google" })
                      }
                    >
                      Add another
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/settings");
                  isMobile && setOpenMobile(false);
                }}
                className="flex gap-3 items-center"
              >
                <Settings />
                Налаштування
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault();
                setIsLoggingOut(true);
                await authClient.signOut();
                router.push("/login");
              }}
              className="flex gap-3 items-center !text-red-500"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="animate-spin w-4 mx-auto h-4 text-[#b2b2b2]" />
              ) : (
                <>
                  <LogOut />
                  <span>Вихід</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
