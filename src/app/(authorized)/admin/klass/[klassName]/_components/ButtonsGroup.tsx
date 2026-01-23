"use client";

import { type UserRole } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import UpdateUsers from "../../../../../_components/shared/SelectUsersModal";

import { Button } from "~/shadcn/ui/button";

interface Props {
  klassName: string;
  initialData: {
    id: string;
    name: string;
    teachers: {
      balance: number;
      role: UserRole;
      email: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      image: string | null;
      emailVerified: boolean;
      studentClassId: string | null;
    }[];
    students: {
      balance: number;
      role: UserRole;
      email: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      image: string | null;
      emailVerified: boolean;
      studentClassId: string | null;
    }[];
  };
}

export default function ButtonsGroup({ klassName, initialData }: Props) {
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [students, setStudents] = useState(initialData.students);
  const [teachers, setTeachers] = useState(initialData.teachers);

  const utils = api.useUtils();

  const getAdminDataMutation = api.klass.getAdminKlassData.useQuery(
    {
      name: klassName,
    },
    {
      initialData,
    },
  );

  const updateUsersMutation = api.klass.updateUsers.useMutation({
    onSuccess: async () => {
      toast.success("Користувачів оновлено");
      void utils.klass.getKlassStudents.invalidate({ id: initialData.id });
      setIsTeachersModalOpen(false);
      setIsStudentsModalOpen(false);

      const { data: newData, isSuccess } = await getAdminDataMutation.refetch();

      if (isSuccess && newData) {
        setStudents(newData.students);
        setTeachers(newData.teachers);
      } else {
        toast.error(
          "Помилка синхронізації списку користувачів після оновлення. Перезавантажте сторінку",
        );
      }
    },
  });

  return (
    <div className="flex gap-2 items-center mb-5">
      <UpdateUsers
        open={isStudentsModalOpen}
        onOpenChange={setIsStudentsModalOpen}
        klassId={initialData.id}
        users={students}
        usersType="STUDENT"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate(
            {
              usersIds: users.map((u) => u.id),
              klassId: initialData.id,
              usersRole: "STUDENT",
            },
            {
              onSuccess: () => {
                void utils.user.getUsersByRole.invalidate({ role: "STUDENT" });
              },
            },
          );
        }}
      >
        <Button>Редагувати учнів</Button>
      </UpdateUsers>

      <UpdateUsers
        open={isTeachersModalOpen}
        onOpenChange={setIsTeachersModalOpen}
        klassId={initialData.id}
        users={teachers}
        usersType="TEACHER"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate(
            {
              usersIds: users.map((u) => u.id),
              klassId: initialData.id,
              usersRole: "TEACHER",
            },
            {
              onSuccess: () => {
                void utils.user.getUsersByRole.invalidate({ role: "TEACHER" });
              },
            },
          );
        }}
      >
        <Button>Редагувати вчителів</Button>
      </UpdateUsers>
    </div>
  );
}
