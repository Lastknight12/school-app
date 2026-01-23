import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import StatsPage from "./_components/StatsPage";

export default async function Page() {
  const session = await getServerAuthSession();
  checkRole(session, ["STUDENT", "RADIO_CENTER"]);

  return <StatsPage />;
}
