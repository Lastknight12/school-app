import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import MusicOrdersPage from "./_components/MusicOrdersPage";

export default async function Page() {
  const session = await getServerAuthSession();
  checkRole(session, ["RADIO_CENTER"]);

  return <MusicOrdersPage />;
}
