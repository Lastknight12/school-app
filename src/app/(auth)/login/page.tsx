import { notFound } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Login from "~/app/_components/(auth)/Login";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    return notFound();
  }

  return <Login />;
}
