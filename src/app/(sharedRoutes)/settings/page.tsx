import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Settings from "~/app/_components/shared/routes/settings";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  const showCardDesign = session.user.role === "STUDENT";

  return <Settings session={session} showCardDesign={showCardDesign} />;
}
