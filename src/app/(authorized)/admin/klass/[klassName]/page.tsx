import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

import ButtonsGroup from "./_components/ButtonsGroup";
import StudentsTable from "./_components/StudentTable";
import { StudentTableSearch } from "./_components/StudentTableSearch";

export default async function Page({
  params,
}: {
  params: { klassName: string };
}) {
  const decodedName = decodeURIComponent(params.klassName);

  const klass = await api.klass.getAdminKlassData({ name: decodedName });

  if (!klass) {
    return notFound();
  }

  return (
    <main className="px-6">
      <StudentsTable klassId={klass.id}>
        <div className="flex items-ceter justify-between">
          <StudentTableSearch />

          <ButtonsGroup initialData={klass} klassName={decodedName} />
        </div>
      </StudentsTable>
    </main>
  );
}
