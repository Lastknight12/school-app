import { getServerAuthSession } from "~/server/auth";

import { checkRole } from "~/lib/utils";

import DbAdminPanel from "./_components";

export default async function Page() {
  const session = await getServerAuthSession();

  checkRole(session, ["ADMIN"]);

  return <DbAdminPanel />;
}
