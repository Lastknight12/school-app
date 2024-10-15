"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function TeacherItem() {
  const pathname = usePathname();
  const klassName = useSearchParams().get("formatedName");

  const paths = new Map<string | RegExp, React.ReactNode>([
    [
      // /klass/*
      /^\/klass\/.+$/,
      <>
        <h1 className="text-xl">{klassName} Клас</h1>
      </>,
    ],
    [
      "/",
      <>
        <h1 className="text-xl">Список класів</h1>
      </>,
    ],
  ]);

  for (const [path, element] of paths.entries()) {
    if (typeof path === "string" ? pathname === path : path.test(pathname)) {
      return element;
    }
  }

  return paths.get(pathname);
}
