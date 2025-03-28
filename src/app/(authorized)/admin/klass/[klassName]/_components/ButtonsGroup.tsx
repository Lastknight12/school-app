"use client";

import { type User as UserModel, UserRole } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import getAdminData from "~/server/callers/klass/adminData/post";
import updateKlassUsers from "~/server/callers/klass/updateUsers/post";

import UpdateUsers from "../../../../../_components/shared/SelectUsersModal";

import { Button } from "~/shadcn/ui/button";

interface Props {
  klassName: string;
  initialData: {
    id: string;
    name: string;
    teachers: {
      role: UserRole;
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      emailVerified: boolean | null;
      studentClassId: string | null;
    }[];
    students: {
      role: UserRole;
      id: string;
      name: string;
      email: string;
      image: string;
      balance: number;
      emailVerified: boolean | null;
      studentClassId: string | null;
    }[];
  };
}

export default function ButtonsGroup({ klassName, initialData }: Props) {
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [students, setStudents] = useState(initialData.students);
  const [teachers, setTeachers] = useState(initialData.teachers);

  const utils = useQueryClient();

  const newAdminData = getAdminData({ name: klassName }, { initialData });

  const updateUsersMutation = updateKlassUsers({
    onSuccess: async () => {
      toast.success("Користувачів оновлено");
      void utils.invalidateQueries({
        queryKey: ["getKlassStudents", { id: initialData.id }],
      });

      setIsTeachersModalOpen(false);
      setIsStudentsModalOpen(false);

      const { data: newData, isSuccess } = await newAdminData.refetch();

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
                void utils.invalidateQueries({
                  queryKey: ["getUsersByRole", { role: "STUDENT" }],
                });
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
                void utils.invalidateQueries({
                  queryKey: ["getUsersByRole", { role: "TEACHER" }],
                });
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
