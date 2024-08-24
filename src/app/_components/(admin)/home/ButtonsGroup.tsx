"use client";

import { api } from "~/trpc/react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import Image from "next/image";
import { useState } from "react";
import Spinner from "~/components/ui/spinner";
import { addKlassSchema } from "~/schemas/zod";
import { toast } from "sonner";
import { z } from "zod";

export default function ButtonsGroup() {
  const { data: teacher } = api.user.getAllTeachers.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const addKlassMutation = api.klass.addKlass.useMutation({
    onSuccess: () => {
      void utils.klass.getAllKlasses.invalidate();
      setIsOpen(false);
    },
  });

  const [klassName, setKlassName] = useState("");
  const [teacherId, setTeacherId] = useState("");

  async function handleClick() {
    try {
      addKlassSchema.parse({ name: klassName, teacherId });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0]!.message);
        return;
      }
    }

    addKlassMutation.mutate({ name: klassName, teacherId });
  }

  return (
    <div className="mb-3">
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          <button
            className="rounded-lg bg-card px-4 py-2 text-sm"
            disabled={addKlassMutation.isPending}
          >
            Добавити клас
          </button>
        </DialogTrigger>
        <DialogContent className="backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Добавити клас</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <input
              type="text"
              value={klassName}
              onChange={(e) => setKlassName(e.target.value)}
              className="mb-3 border-b border-[#8f8f8f] bg-transparent px-5 py-2 pb-2 pl-0 text-[#dcdcdc] outline-none placeholder:text-[#8f8f8f]"
              placeholder="Введіть назву"
            />

            <Select onValueChange={setTeacherId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Виберіть вчителя" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {teacher?.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={teacher.id}
                      className="px-2"
                    >
                      <div className="flex items-center justify-start gap-2">
                        <Image
                          src={teacher.image}
                          alt="avatar"
                          width={25}
                          height={25}
                          className="rounded-full"
                        />
                        <p>{teacher.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <button
              disabled={addKlassMutation.isPending}
              className={`flex items-center gap-2 rounded-lg bg-card ${addKlassMutation.isPending && "cursor-not-allowed opacity-40"} px-4 py-3 text-sm`}
              type="submit"
              onClick={handleClick}
            >
              Добавити {addKlassMutation.isPending && <Spinner />}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
