import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

import { checkRole } from "~/lib/utils";

import ReplenishDialog from "./_components/ReplenishDialog";
import ReplenishHistory from "./_components/ReplenishHistory";

export default async function KaznaPage() {
  const session = await getServerAuthSession();
  checkRole(session, ["ADMIN"]);

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
