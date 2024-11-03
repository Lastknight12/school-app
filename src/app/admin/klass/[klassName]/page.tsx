import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

import ButtonsGroup from "~/app/_components/(admin)/klass/ButtonsGroup";
import StudentsTable from "~/app/_components/(admin)/klass/StudentTable";
import { StudentTableSearch } from "~/app/_components/(admin)/klass/StudentTableSearch";

export default async function Page({
  params,
}: {
  params: { klassName: string };
}) {
  const decodedParam = decodeURIComponent(params.klassName);

  const klass = await api.klass.getAdminKlassData({ name: decodedParam });

  if (!klass) {
    return notFound();
  }

  return (
    <main className="px-6">
      <StudentsTable klassId={klass.id}>
        {/* Table header */}
        <div className="flex items-ceter justify-between">
          <StudentTableSearch />

          <ButtonsGroup
            klassId={klass.id}
            klassStudents={klass.students}
            klassTeachers={klass.teachers}
          />
        </div>
      </StudentsTable>
    </main>
  );
}
