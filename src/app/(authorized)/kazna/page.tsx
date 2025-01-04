import { api } from "~/trpc/server";

import ReplenishDialog from "~/app/_components/authorizedPages/kazna/ReplenishDialog";
import ReplenishHistory from "~/app/_components/authorizedPages/kazna/ReplenishHistory";

export default async function KaznaPage() {
  const kaznaAmount = await api.kazna.getKaznaAmount();

  return (
    <div className="px-6 flex items-center w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl">{kaznaAmount}</h1>
        <ReplenishDialog />
      </div>

      <ReplenishHistory />
    </div>
  );
}
