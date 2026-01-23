import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import PlayerPage from "./_components/PlayerPage";

export default async function Page() {
  const session = await getServerAuthSession();
  checkRole(session, ["RADIO_CENTER"]);

  return <PlayerPage />;
}
