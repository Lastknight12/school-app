import Image from "next/image";
import { notFound } from "next/navigation";
import ButtonsGroup from "~/app/_components/(admin)/klass/ButtonsGroup";
import StudentsTable from "~/app/_components/(admin)/klass/StudentTable";

import { api } from "~/trpc/server";

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
    <main className="px-5">
      <div className="mb-3">
        <h1 className="text-lg">{klass.name} Клас</h1>
        <div className="flex items-center gap-4">
          {klass.teacher && (
            <>
              <h2 className="text-lg">Класний керівник:</h2>
              <div className="flex items-center gap-2">
                <Image
                  src={klass.teacher.image}
                  alt="avatar"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <p>{klass.teacher.name}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <ButtonsGroup klassId={klass.id} />

      <StudentsTable klassId={klass.id} />
    </main>
  );
}
