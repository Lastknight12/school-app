import KlassTable from "~/app/_components/(teacher)/klass/[id]/KlassTable";

export default function Page({ params }: { params: { id: string } }) {
  return <KlassTable id={params.id} />;
}
