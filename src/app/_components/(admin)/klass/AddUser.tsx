"use client";

import { type User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "~/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/shadcn/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/shadcn/ui/popover";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users?: User[];
  isFetching: boolean;
  isPending: boolean;
  emptyMessage: string;
  notFoundMessage: string;
  children?: React.ReactNode;
  inputPlaceholder?: string;
  onClick: (id: string) => void;
}

export default function AddUser({
  open: customOpen,
  onOpenChange: customOnOpenChange,
  users,
  isFetching,
  isPending,
  emptyMessage,
  notFoundMessage,
  inputPlaceholder = "Знайти користувача",
  onClick,
  children = "Додати користувача",
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function onSelect(userId: string) {
    setValue(userId);
    onClick?.(userId);
  }

  return (
    <Popover
      open={customOpen ?? open}
      onOpenChange={customOnOpenChange ?? setOpen}
    >
      <PopoverTrigger asChild>
        <Button role="combobox" aria-expanded={open} className="h-max">
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={inputPlaceholder} />
          <CommandList>
            {!isFetching && users?.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>{notFoundMessage}</CommandEmpty>
                <CommandGroup>
                  {users?.map((user) => (
                    <CommandItem
                      key={user.id}
                      className="relative"
                      value={user.name}
                      onSelect={() => onSelect(user.id)}
                      disabled={isPending}
                    >
                      {isPending && value === user.id && (
                        <Loader2 className=" absolute left-[calc(50%-20px/2)] h-4 w-4 animate-spin text-[#b5b5b5]" />
                      )}
                      <div
                        style={{
                          opacity: isPending && value === user.id ? 0.1 : 1,
                        }}
                        className={`flex w-full items-center gap-2`}
                      >
                        <Image
                          src={user.image}
                          alt="avatar"
                          width={30}
                          height={30}
                          className="rounded-full h-[30px]"
                        />
                        <p>{user.name}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
