import { getServerAuthSession } from "~/server/auth";

import Transactions from "./_components/Transactions";

export default async function Component() {
  const session = await getServerAuthSession();

  return <Transactions session={session!} />;
}
