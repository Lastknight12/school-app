import { getServerAuthSession } from "~/server/auth";

import Leaderboard from "./_components/Leaderboard";

export default async function LeaderboardPage() {
  const session = await getServerAuthSession();

  return <Leaderboard session={session!} />;
}
