import KlassTable from "~/app/_components/authorizedPages/klass/[id]/KlassTable";

type Params = {id: string}

export default async function Page({ params }: { params: Params }) {
  const {id} = params

  return <KlassTable id={id} />;
}
