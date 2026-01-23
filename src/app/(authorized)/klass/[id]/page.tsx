import { notFound } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

import KlassTable from "./_components/KlassTable";

type Params = { id: string };

export default async function Page({ params }: { params: Params }) {
  const { id } = params;
  const session = await getServerAuthSession();
  if (session?.user.role !== "TEACHER") return notFound();

  const klasses = await api.user.getTeacherKlasses();
  if (!klasses.some((klass) => klass.id === id)) {
    return notFound();
  }

  return <KlassTable id={id} />;
}
