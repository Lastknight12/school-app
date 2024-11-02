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
import { SidebarInset, SidebarTrigger } from "~/shadcn/ui/sidebar";

export default function SidebarPath({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {pathName.split("/").map((path, index) => (
                <div key={`${path}-${index}-item`} className="flex items-ceter min-w-[640px]:gap-2.5 gap-1.5">
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <Link href={`/${path}`} >{path}</Link>
                    </BreadcrumbPage>
                  </BreadcrumbItem>

                  {index !== pathName.split("/").length - 1 && (
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
      {children}
    </SidebarInset>
  );
}
