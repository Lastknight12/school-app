import { notFound } from "next/navigation";

import getAdminData from "~/server/callers/klass/adminData/server";

import ButtonsGroup from "./_components/ButtonsGroup";
import StudentsTable from "./_components/StudentTable";
import { StudentTableSearch } from "./_components/StudentTableSearch";

export default async function Page({
  params,
}: {
  params: { klassName: string };
}) {
  const decodedName = decodeURIComponent(params.klassName);

  const klass = await getAdminData({ name: decodedName });

  if (!klass) {
    return notFound();
  }

  return (
    <main className="px-6">
      <StudentsTable klassId={klass.id}>
        {/* Table header */}

        <div className="flex items-ceter justify-between">
          <StudentTableSearch />

          <ButtonsGroup initialData={klass} klassName={decodedName} />
        </div>
      </StudentsTable>
    </main>
  );
}
