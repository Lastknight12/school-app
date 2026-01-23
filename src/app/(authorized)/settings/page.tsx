import { getServerAuthSession } from "~/server/auth";

import Settings from "./_components/Settings";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  return <Settings session={session} />;
}
