import { getServerAuthSession } from "~/server/auth";

import Leaderboard from "~/app/_components/authorizedPages/leaderboard";

export default async function LeaderboardPage() {
  const session = await getServerAuthSession();

  return <Leaderboard session={session!} />;
}
