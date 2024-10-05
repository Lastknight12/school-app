import { getServerAuthSession } from "~/server/auth";
import Transactions from "../../_components/(student)/transactions";
import { redirect } from "next/navigation";

export default async function Component() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  return <Transactions session={session} />;
}
