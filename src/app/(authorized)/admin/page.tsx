import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import { KlassList } from "./_components/KlassList";

export default async function KlassesTable() {
  const session = await getServerAuthSession();

  checkRole(session, ["ADMIN"]);

  return <KlassList />;
}
