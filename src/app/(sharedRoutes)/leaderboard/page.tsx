import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Leaderboard from "~/app/_components/shared/leaderboard";

export default async function LeaderboardPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  return <Leaderboard session={session} />;
}
