import { getServerAuthSession } from "~/server/auth";

import Settings from "./_components/Settings";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  const showCardDesign = session!.user.role === "STUDENT";

  return <Settings session={session!} showCardDesign={showCardDesign} />;
}
