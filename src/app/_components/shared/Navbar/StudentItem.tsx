"use client";

import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  userBalance: number;
}

export default function StudentItem({ userBalance: balance }: Props) {
  const pathname = usePathname();
  const paths = new Map<string, React.ReactNode>([
    [
      "/",
      <>
        <h1 className="text-3xl">
          {"$" + (balance.toString().length > 5
            ? balance.toString().slice(0, 5) + "..."
            : balance.toString())}
        </h1>
      </>,
    ],
    [
      "/stats",
      <h1 className="text-xl" key={"Stats"}>
        Stats
      </h1>,
    ],
    [
      "/transactions",
      <h1 className="text-xl" key={"transactions"}>
        Transactions
      </h1>,
    ],
    [
      "/settings",
      <h1 className="text-xl" key={"settings"}>
        Settings
      </h1>,
    ],
    [
      "/shop",
      <h1 className="text-xl" key={"shop"}>
        Shop
      </h1>,
    ],
    [
      "/buy",
      <h1 className="text-xl" key={"buy"}>
        Buy products
      </h1>,
    ],
  ]);

  return paths.get(pathname);
}
