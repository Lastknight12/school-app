import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

import StudentsTable from "~/app/_components/(admin)/klass/StudentTable";
import UpdateUsers from "~/app/_components/(admin)/klass/UpdateUsers";

import { Button } from "~/shadcn/ui/button";

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
      </div>

      <div className="mb-5 flex items-center justify-end gap-3">
        <UpdateUsers
          klassId={klass.id}
          users={klass.students}
          usersType="STUDENT"
        >
          <Button>Manage students</Button>
        </UpdateUsers>

        <UpdateUsers
          klassId={klass.id}
          users={klass.teachers}
          usersType="TEACHER"
        >
          <Button>Manage teachers</Button>
        </UpdateUsers>
      </div>

      <StudentsTable klassId={klass.id} />
    </main>
  );
}
