"use client";

import { type User as UserModel } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import UsersList from "./UsersList";

import { Avatar, AvatarImage } from "~/shadcn/ui/avatar";
import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { ScrollArea } from "~/shadcn/ui/scroll-area";

type CustomUser = Pick<UserModel, "email" | "image" | "id" | "name">;

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  klassId?: string;
  users?: CustomUser[];
  usersType: "STUDENT" | "TEACHER";
  children: ReactNode;
  onSubmit?: (users: CustomUser[]) => void;
  isPending?: boolean;
  initialData?: CustomUser;
}

export default function UpdateUsers({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  usersType,
  children,
  users,
  onSubmit,
  isPending,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<CustomUser[]>(users ?? []);

  const {
    data: students,
    isFetching: isFetchingStudents,
    isLoading: isLoadingStudents,
  } = api.user.getUsersByRole.useQuery(
    { role: "STUDENT" },
    {
      enabled: usersType === "STUDENT",
    },
  );

  const {
    data: teachers,
    isFetching: isFetchingTeachers,
    isLoading: isLoadingTeachers,
  } = api.user.getUsersByRole.useQuery(
    { role: "TEACHER" },
    {
      enabled: usersType === "TEACHER",
    },
  );
  const noUsersFound =
    (students?.length === 0 && usersType === "STUDENT") ||
    (teachers?.length === 0 && usersType === "TEACHER");

  function toggleUser(user: CustomUser) {
    setSelectedUsers((prev) =>
      prev.some((selectedUser) => selectedUser.email === user.email)
        ? prev.filter((selectedUser) => selectedUser.email !== user.email)
        : [...prev, user],
    );
  }

  function handleSubmit() {
    if (selectedUsers.length > 0) {
      onSubmit?.(selectedUsers);
    } else {
      toast.error("Виберіть хоча б 1 користувача");
    }
  }

  return (
    <Dialog
      open={openProp ?? open}
      onOpenChange={(open) => {
        !open &&
          setTimeout(() => {
            setSelectedUsers(users ?? []);
          }, 150);
        onOpenChangeProp?.(open);
        !openProp && setOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Виберіть користувачів</DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <div>
            {noUsersFound && (
              <div>
                Жодних {usersType === "STUDENT" ? "Учнів" : "Викладачів"} не
                знайдено
              </div>
            )}

            {(isLoadingTeachers || isLoadingStudents) && (
              <div className="flex justify-center mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
              </div>
            )}

            {students && students.length > 0 && usersType === "STUDENT" && (
              <UsersList
                onSelect={toggleUser}
                selectedUsers={selectedUsers}
                users={students}
                isFetching={isFetchingStudents}
              />
            )}

            {teachers && teachers.length > 0 && usersType === "TEACHER" && (
              <UsersList
                onSelect={toggleUser}
                selectedUsers={selectedUsers}
                users={teachers}
                isFetching={isFetchingTeachers}
              />
            )}
          </div>

          {selectedUsers.length > 0 && (
            <>
              <div>
                <ScrollArea className="h-[100px] bg-accent rounded-lg px-1">
                  <div className="flex flex-wrap gap-2 p-2">
                    {selectedUsers.map((user) => (
                      <Avatar key={user.email} className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                      </Avatar>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex items-center !justify-between !flex-row">
          <div>Обрано користувачів: {selectedUsers.length}</div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || isPending}
          >
            Підтвердити
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin ml-2 text-[#b2b2b2]" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
