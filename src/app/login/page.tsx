import { notFound } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import Login from "./_components/Login";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    return notFound();
  }

  return <Login />;
}
