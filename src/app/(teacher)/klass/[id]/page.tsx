import KlassTable from "~/app/_components/(teacher)/klass/[id]/KlassTable";
import { getServerAuthSession } from "~/server/auth";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  return <KlassTable id={params.id} session={session} />;
}
