"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

interface Props {
  userBalance: number;
}

export default function NavbarLeftItem({ userBalance: balance }: Props) {
  const pathname = usePathname();
  const paths = new Map<string, React.ReactNode>([
    [
      "/",
      <>
        <h1 className="text-3xl">{"$" + balance}</h1>

        <div className="flex items-center justify-center rounded-full bg-[#fafafa26] p-1">
          <MdKeyboardArrowDown fill="white" />
        </div>
      </>,
    ],
    [
      "/stats",
      <h1 className="text-3xl" key={"Stats"}>
        Stats
      </h1>,
    ],
    [
      "/transactions",
      <h1 className="text-3xl" key={"transactions"}>
        Transactions
      </h1>,
    ],
    [
      "/settings",
      <h1 className="text-3xl" key={"settings"}>
        Settings
      </h1>,
    ],
  ]);

  return paths.get(pathname);
}
