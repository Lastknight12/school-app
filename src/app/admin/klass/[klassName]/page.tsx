import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

import ButtonsGroup from "~/app/_components/(admin)/klass/ButtonsGroup";
import StudentsTable from "~/app/_components/(admin)/klass/StudentTable";
import TeachersList from "~/app/_components/(admin)/klass/TeachersList";

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
      <div className="mb-3 flex gap-3 items-center">
        <h1 className="text-lg">{klass.name} Клас</h1>
        <TeachersList klassId={klass.id} />
      </div>

      <div className="mb-5">
        <ButtonsGroup klassId={klass.id} />
      </div>

      <StudentsTable klassId={klass.id} />
    </main>
  );
}
