"use client";

import type { Session } from "next-auth";
import { usePathname, useSearchParams } from "next/navigation";

interface Props {
  session: Session;
}

export default function TeacherItem({ session }: Props) {
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
        <h1 className="text-xl">Баланс: {session.user.balance}$</h1>
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
