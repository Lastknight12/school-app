"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import BadgesModelContent from "~/app/_components/(admin)/db/BadgesModelContent";
import ModelsList from "~/app/_components/(admin)/db/ModelsList";
import TransfersModelContent from "~/app/_components/(admin)/db/TransfersModelContent";
import UsersModelContent from "~/app/_components/(admin)/db/UsersModelContent";

type Tabs = "users" | "badges" | "transactions";

export default function Page() {
  const tab = useSearchParams().get("tab");
  const isTabCorrect =
    tab === "users" || tab === "badges" || tab === "transactions";

  const [currentModel, setCurrentModel] = useState<Tabs>(
    isTabCorrect ? (tab as Tabs) : "users",
  );

  useEffect(() => {
    if (tab && isTabCorrect) {
      setCurrentModel(tab as Tabs);
    }
  }, [isTabCorrect, tab]);

  return (
    <div className="px-6">
      <div className="mb-5">
        <ModelsList onClick={setCurrentModel} activeItem={currentModel}/>
      </div>

      {currentModel === "users" && <UsersModelContent />}

      {currentModel === "transactions" && <TransfersModelContent />}

      {currentModel === "badges" && <BadgesModelContent />}
    </div>
  );
}
