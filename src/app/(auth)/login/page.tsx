import { notFound } from "next/navigation";
import Login from "~/app/(auth)/login/_components/Login";

import { getServerAuthSession } from "~/server/auth";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    return notFound();
  }

  return <Login />;
}
