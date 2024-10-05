"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  klassId: string;
}

export default function ButtonsGroup({ klassId }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const getStudents = api.user.getAllStudents.useQuery();

  const utils = api.useUtils();

  const addStudentMutation = api.klass.addStudent.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.klass.getKlassStudents.invalidate();
      toast.success(`Учня додано до класу`);
    },

    onError: () => {
      toast.error(`Помилка додавання учня до класу`);
    }
  });

  function onSelect(studentId: string) {
    setValue(studentId);
    addStudentMutation.mutate({ klassId, studentId });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className="h-max w-[200px] justify-between"
        >
          Добавити учня
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Знайти учня" />
          <CommandList>
            {!getStudents.isFetching && getStudents.data?.length === 0 ? (
              <CommandEmpty>Учнів не знайдено</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>Учня з такою назвою не знайдено</CommandEmpty>
                <CommandGroup>
                  {getStudents.data?.map((student) => (
                    <CommandItem
                      key={student.id}
                      className="relative"
                      value={student.name}
                      onSelect={() => onSelect(student.id)}
                      disabled={addStudentMutation.isPending}
                    >
                      {addStudentMutation.isPending && value === student.id && (
                        <Loader2 className=" absolute left-[calc(50%-20px/2)] h-4 w-4 animate-spin text-[#b5b5b5]" />
                      )}
                      <div
                        style={{
                          opacity:
                            addStudentMutation.isPending && value === student.id
                              ? 0.1
                              : 1,
                        }}
                        className={`flex w-full items-center gap-2`}
                      >
                        <Image
                          src={student.image}
                          alt="avatar"
                          width={30}
                          height={30}
                          className="rounded-full h-[30px]"
                        />
                        <p>{student.name}</p>
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
