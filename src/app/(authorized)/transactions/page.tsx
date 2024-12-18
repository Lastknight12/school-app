import { getServerAuthSession } from "~/server/auth";

import Transactions from "~/app/_components/transactions";

export default async function Component() {
  const session = await getServerAuthSession();

  return <Transactions session={session!} />;
}
