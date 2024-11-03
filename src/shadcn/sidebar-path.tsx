"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/shadcn/ui/breadcrumb";
import { Separator } from "~/shadcn/ui/separator";
import { SidebarTrigger } from "~/shadcn/ui/sidebar";

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function SidebarPath() {
  const pathname = usePathname();

  const paths = pathname
    .split("/")
    .filter((path) => path !== "" && path !== "admin");

  return (
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Link href="/">Home</Link>
                </BreadcrumbPage>
              </BreadcrumbItem>

              {pathname !== "/" && pathname !== "/admin" && (
                <BreadcrumbSeparator />
              )}

              {paths.map((path, index) => (
                <div
                  key={`${path}-${index}-item`}
                  className="flex items-ceter gap-1.5 min-[640px]:gap-2.5"
                >
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <Link href={`/${path}`}>{capitalizeFirstLetter(decodeURIComponent(path))}</Link>
                    </BreadcrumbPage>
                  </BreadcrumbItem>

                  {index !== paths.length - 1 && (
                    <BreadcrumbSeparator
                      className="text-muted-foreground flex items-center justify-center"
                      key={`${path}-${index}-separator`}
                    />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
  );
}
