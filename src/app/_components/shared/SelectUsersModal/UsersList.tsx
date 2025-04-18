import { type User as UserModel } from "@prisma/client";
import { CheckIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { cn } from "~/lib/utils";

import { Input } from "~/shadcn/ui/input";
import { ScrollArea } from "~/shadcn/ui/scroll-area";

type CustomUser = Pick<UserModel, "email" | "image" | "id" | "name">;

interface Props {
  onSelect: (user: CustomUser) => void;
  selectedUsers: CustomUser[];
  users: CustomUser[];
  isFetching?: boolean;
}

export default function UsersList({
  users,
  onSelect,
  selectedUsers,
  isFetching,
}: Props) {
  const [searchName, setSearchName] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<CustomUser[]>(users);

  function handleInputChange(value: string) {
    setSearchName(value);

    if (value.length > 0) {
      setFilteredUsers(
        users?.filter(
          (user) =>
            user.name.toLowerCase().includes(value.toLowerCase()) ||
            user.email.toLowerCase().includes(value.toLowerCase()),
        ),
      );
    } else {
      setFilteredUsers(users);
    }
  }

  return (
    <>
      <Input
        value={searchName}
        variant="accent"
        placeholder="Search users..."
        onChange={(e) => handleInputChange(e.target.value)}
      />

      <ScrollArea className="h-[200px] my-4">
        {filteredUsers.length === 0 && (
          <div className="text-center">
            Користувачів з такою назвою не знайдено
          </div>
        )}

        {isFetching && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#b5b5b5]" />
          </div>
        )}

        {filteredUsers.map((user) => {
          const isUserSelected = selectedUsers.some((u) => u.id === user.id);

          return (
            <div
              key={user.id}
              onClick={() => onSelect?.(user)}
              className={cn(
                "cursor-pointer flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors",
                isUserSelected && "opacity-50",
              )}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={user.image}
                  alt="user avatar"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <span>{user.name}</span>
              </div>

              <CheckIcon
                className={cn(
                  "ml-auto h-4 w-4",
                  // Check if user is in selected users or already in klass
                  isUserSelected ? "opacity-100" : "opacity-0",
                )}
              />
            </div>
          );
        })}
      </ScrollArea>
    </>
  );
}
