"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Purchases from "./Purchases";
import TabsList from "./TabsList";
import Transactions from "./Transactions";
import Users from "./Users";

export type Tab = "users" | "transactions" | "purchases";

export default function DbAdminPanel() {
  const router = useRouter();
  const tab = useSearchParams().get("tab");
  const isTabCorrect =
    tab === "users" || tab === "transactions" || tab === "purchases";

  const [currentTab, setCurrentTab] = useState<Tab>(
    isTabCorrect ? (tab as Tab) : "users",
  );

  useEffect(() => {
    if (tab && isTabCorrect) {
      setCurrentTab(tab as Tab);
    }
  }, [isTabCorrect, tab]);

  function handleClick(tab: Tab) {
    setCurrentTab(tab);
    router.push(`${window.location.pathname}?tab=${tab}`);
  }

  return (
    <div className="px-6" suppressHydrationWarning={true}>
      <div className="mb-5">
        <TabsList onClick={handleClick} activeItem={currentTab} />
      </div>

      {currentTab === "users" && <Users />}

      {currentTab === "transactions" && <Transactions />}

      {currentTab === "purchases" && <Purchases />}
    </div>
  );
}
