"use client";

import { type User as UserModel } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import updateKlassUsers from "~/server/callers/klass/updateUsers/post";

import UpdateUsers from "../../../../../_components/shared/SelectUsersModal";

import { Button } from "~/shadcn/ui/button";

type CustomUser = Pick<UserModel, "email" | "image" | "id" | "name">;

interface Props {
  klassId: string;
  klassStudents: CustomUser[];
  klassTeachers: CustomUser[];
}

export default function ButtonsGroup({
  klassId,
  klassStudents,
  klassTeachers,
}: Props) {
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);

  const utils = useQueryClient();

  const updateUsersMutation = updateKlassUsers({
    onSuccess: () => {
      toast.success("Користувачів оновлено");
      void utils.invalidateQueries({ queryKey: ["getKlassStudents"] });
      setIsTeachersModalOpen(false);
      setIsStudentsModalOpen(false);
    },
  });

  return (
    <div className="flex gap-2 items-center mb-5">
      <UpdateUsers
        open={isStudentsModalOpen}
        onOpenChange={setIsStudentsModalOpen}
        klassId={klassId}
        klassUsers={klassStudents}
        usersType="STUDENT"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate({
            usersIds: users.map((u) => u.id),
            klassId,
            usersRole: "STUDENT",
          });
        }}
      >
        <Button>Редагувати учнів</Button>
      </UpdateUsers>

      <UpdateUsers
        open={isTeachersModalOpen}
        onOpenChange={setIsTeachersModalOpen}
        klassId={klassId}
        klassUsers={klassTeachers}
        usersType="TEACHER"
        isPending={updateUsersMutation.isPending}
        onSubmit={(users) => {
          updateUsersMutation.mutate({
            usersIds: users.map((u) => u.id),
            klassId,
            usersRole: "TEACHER",
          });
        }}
      >
        <Button>Редагувати вчителів</Button>
      </UpdateUsers>
    </div>
  );
}
