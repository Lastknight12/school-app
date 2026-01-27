import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import ShopPage from "./_components/ShopPage";

export default async function Page() {
  const session = await getServerAuthSession();
  checkRole(session, ["STUDENT", "RADIO_CENTER", "ADMIN"]);

  return <ShopPage />;
}
