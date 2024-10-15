import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Stats from "~/app/_components/(student)/stats/StatsWrapper";

export default async function Page() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return redirect("/login");
  }

  return <Stats />;
}
