import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import BuyPage from "./_components/BuyPage";

export default async function Page() {
  const session = await getServerAuthSession();
  checkRole(session, ["STUDENT"]);

  return <BuyPage />;
}
