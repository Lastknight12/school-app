"use client";

import { type User } from "@prisma/client";
import { CheckIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "~/shadcn/ui/avatar";
import { Button } from "~/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/shadcn/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { ScrollArea } from "~/shadcn/ui/scroll-area";

interface Props {
  klassId: string;
  users: User[];
  usersType: "STUDENT" | "TEACHER";
  children: React.ReactNode;
}

export default function UpdateUsers({
  klassId,
  users,
  usersType,
  children,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  const updateUsersMutation = api.klass.updateUsers.useMutation();

  function toggleUser(user: User) {
    setSelectedUsers((prev) =>
      prev.some((selectedUser) => selectedUser.email === user.email)
        ? prev.filter((selectedUser) => selectedUser.email !== user.email)
        : [...prev, user],
    );
  }

  function handleSubmit() {
    if (selectedUsers.length > 0) {
      updateUsersMutation.mutate({
        klassId,
        usersIds: selectedUsers.map((user) => user.id),
        usersRole: usersType,
      });
    } else {
      toast.error("Виберіть хоча б 1 користувача");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select users</DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup heading="Users">
                <ScrollArea className="h-[200px]">
                  {users.map((user) => (
                    <CommandItem
                      key={user.email}
                      onSelect={() => toggleUser(user)}
                      className="cursor-pointer"
                    >
                      <Avatar className="mr-2 h-6 w-6">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedUsers.some(
                            (selectedUser) => selectedUser.email === user.email,
                          )
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
            {selectedUsers.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Selected users">
                  <ScrollArea className="h-[100px]">
                    <div className="flex flex-wrap gap-2 p-2">
                      {selectedUsers.map((user) => (
                        <Avatar key={user.email} className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </ScrollArea>
                </CommandGroup>
              </>
            )}
          </Command>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div>{selectedUsers.length} users selected</div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              selectedUsers.length === 0 || updateUsersMutation.isPending
            }
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
