import { notFound } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

import { checkRole } from "~/lib/utils";

import ButtonsGroup from "./_components/ButtonsGroup";
import StudentsTable from "./_components/StudentTable";
import { StudentTableSearch } from "./_components/StudentTableSearch";

export default async function Page({
  params,
}: {
  params: Promise<{ klassName: string }>;
}) {
  const session = await getServerAuthSession();
  checkRole(session, ["ADMIN"]);

  const { klassName } = await params;
  const decodedName = decodeURIComponent(klassName);

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
