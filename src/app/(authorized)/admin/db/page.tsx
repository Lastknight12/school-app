"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ModelsList from "./_components/ModelsList";
import TransactionsTableContent from "./_components/TransactionsTableContent";
import UsersModelContent from "./_components/UsersModelContent";

import PurchasesTableContent from "~/app/_components/shared/PurchasesTableContent";

export type Tabs = "users" | "transactions" | "purchases";

export default function Page() {
  const tab = useSearchParams().get("tab");
  const isTabCorrect =
    tab === "users" || tab === "transactions" || tab === "purchases";

  const [currentModel, setCurrentModel] = useState<Tabs>(
    isTabCorrect ? (tab as Tabs) : "users",
  );

  useEffect(() => {
    if (tab && isTabCorrect) {
      console.log(tab);
      setCurrentModel(tab as Tabs);
    }
  }, [isTabCorrect, tab]);

  return (
    <div className="px-6" suppressHydrationWarning={true}>
      <div className="mb-5">
        <ModelsList onClick={setCurrentModel} activeItem={currentModel} />
      </div>

      {currentModel === "users" && <UsersModelContent />}

      {currentModel === "transactions" && <TransactionsTableContent />}

      {currentModel === "purchases" && <PurchasesTableContent />}
    </div>
  );
}
