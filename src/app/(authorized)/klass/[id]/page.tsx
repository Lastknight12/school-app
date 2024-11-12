import KlassTable from "~/app/_components/authorizedPages/klass/[id]/KlassTable";
import { getServerAuthSession } from "~/server/auth";

type Params = {id: string}

export default async function Page({ params }: { params: Params }) {
  const session = await getServerAuthSession();
  const {id} = params

  return <KlassTable id={id} session={session!} />;
}
