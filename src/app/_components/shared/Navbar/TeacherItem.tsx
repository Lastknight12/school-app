"use server";

import Spinner from "~/components/ui/spinner";
import { api } from "~/trpc/server";

export default async function TeacherItem() {
  const klass = await api.klass.getKlass();

  if (!klass) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-bold">{klass.name} Класс</h2>
    </div>
  );
}
