import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

import { checkRole } from "~/lib/utils";

import Transactions from "./_components/Transactions";

export default async function Component() {
  const session = await getServerAuthSession();
  checkRole(session, ["ADMIN"]);

  const adminBalance = await api.kazna.getKaznaAmount();

  return <Transactions session={session} balance={adminBalance} />;
}
