import Image from "next/image";
import { notFound } from "next/navigation";

import { api } from "~/trpc/server";

import { cn } from "~/lib/utils";

import ButtonsGroup from "~/app/_components/(admin)/klass/ButtonsGroup";
import StudentsTable from "~/app/_components/(admin)/klass/StudentTable";

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
          {klass.teachers?.map((teacher, i) => (
            <Image
              key={teacher.id}
              src={teacher.image}
              alt="avatar"
              width={25}
              height={25}
              className={cn("rounded-full shadow-md", i !== 0 && "-ml-2")}
            />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <ButtonsGroup klassId={klass.id} />
      </div>

      <StudentsTable klassId={klass.id} />
    </main>
  );
}
