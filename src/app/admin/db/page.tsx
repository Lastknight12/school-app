"use client";

import { useState } from "react";
import BadgesModelContent from "~/app/_components/(admin)/db/BadgesModelContent";

import ModelsList from "~/app/_components/(admin)/db/ModelsList";
import TransfersModelContent from "~/app/_components/(admin)/db/TransfersModelContent";
import UsersModelContent from "~/app/_components/(admin)/db/UsersModelContent";

export default function Page() {
  const [currentModel, setCurrentModel] = useState<
    "users" | "badges" | "transactions"
  >("users");

  return (
    <div className="px-6">
      <div className="mb-5">
        <ModelsList onClick={setCurrentModel} />
      </div>
      {currentModel === "users" && <UsersModelContent />}

      {currentModel === "transactions" && <TransfersModelContent />}

      {currentModel === "badges" && <BadgesModelContent />}
    </div>
  );
}
