"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

interface Props {
  klassId: string;
}

export default function TeachersList({ klassId }: Props) {
  const getKlassTeachers = api.klass.getKlassTeachers.useQuery({ id: klassId });

  return (
    <div className="flex items-center">
      {getKlassTeachers.isFetching && (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      )}

      {getKlassTeachers.data?.map((teacher, i) => (
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
  );
}
