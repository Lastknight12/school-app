import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Transactions from "~/app/_components/(student)/transactions";

export default async function Component() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  return <Transactions session={session} />;
}
