"use client";

import { type User as UserModel } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import UpdateUsers from "../../../shared/SelectUsersModal";

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

  const utils = api.useUtils();

  const updateUsersMutation = api.klass.updateUsers.useMutation({
    onSuccess: () => {
      toast.success("Користувачів оновлено");
      void utils.klass.getKlassStudents.invalidate();
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
