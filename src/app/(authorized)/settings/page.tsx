import { getServerAuthSession } from "~/server/auth";

import Settings from "~/app/_components/authorizedPages/settings";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  const showCardDesign = session!.user.role === "STUDENT";

  return <Settings session={session!} showCardDesign={showCardDesign} />;
}
