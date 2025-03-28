"use client";

import { type User as UserModel } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import getAdminData from "~/server/callers/klass/adminData/post";
import updateKlassUsers from "~/server/callers/klass/updateUsers/post";

import UpdateUsers from "../../../../../_components/shared/SelectUsersModal";

import { Button } from "~/shadcn/ui/button";

type CustomUser = Pick<UserModel, "email" | "image" | "id" | "name">;

interface Props {
  klassId: string;
  klassName: string;
  initStudents: CustomUser[];
  initTeachers: CustomUser[];
}

export default function ButtonsGroup({
  klassId,
  klassName,
  initStudents,
  initTeachers,
}: Props) {
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [students, setStudents] = useState(initStudents);
  const [teachers, setTeachers] = useState(initTeachers);

  const utils = useQueryClient();

  const getAdminDataMutation = getAdminData();

  const updateUsersMutation = updateKlassUsers({
    onSuccess: () => {
      toast.success("Користувачів оновлено");
      void utils.invalidateQueries({
        queryKey: ["getKlassStudents", { id: klassId }],
      });

      setIsTeachersModalOpen(false);
      setIsStudentsModalOpen(false);

      getAdminDataMutation.mutate(
        { name: klassName },
        {
          onSuccess: (newData) => {
            if (newData) {
              setTeachers(newData.teachers);
              setStudents(newData.students);
            }
          },
        },
      );
    },
  });

  return (
    <div className="flex gap-2 items-center mb-5">
      <UpdateUsers
        open={isStudentsModalOpen}
        onOpenChange={setIsStudentsModalOpen}
        klassId={klassId}
        users={students}
        usersType="STUDENT"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate(
            {
              usersIds: users.map((u) => u.id),
              klassId,
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
        klassId={klassId}
        users={teachers}
        usersType="TEACHER"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate(
            {
              usersIds: users.map((u) => u.id),
              klassId,
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
