import { redirect } from "next/navigation";
import Stats from "~/app/_components/(student)/Stats/StatsWrapper";
import { getServerAuthSession } from "~/server/auth";

export default async function Page() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  return <Stats />;
}
