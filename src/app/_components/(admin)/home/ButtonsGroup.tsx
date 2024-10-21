"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { addKlassSchema } from "~/schemas/zod";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import TeachersDropdown from "./TeachersDropdown";

import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";

export default function ButtonsGroup() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const [klassName, setKlassName] = useState("");
  const [teacherIds, setTeacherIds] = useState<string[]>([]);

  const addKlassMutation = api.klass.addKlass.useMutation({
    onSuccess: () => {
      void utils.klass.getAllKlasses.invalidate();
      setIsOpen(false);
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    }
  });

  async function handleClick() {
    try {
      addKlassSchema.parse({ name: klassName, teacherIds: teacherIds });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error);
        toast.error(error.issues[0]!.message);
        return;
      }
    }

    addKlassMutation.mutate({ name: klassName, teacherIds: teacherIds });
  }

  return (
    <div className="mb-5">
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
              placeholder="Назва класу"
            />

            <TeachersDropdown
              teacherIds={teacherIds}
              onSelect={(id) =>
                teacherIds.some((i) => i === id)
                  ? setTeacherIds(teacherIds.filter((i) => i !== id))
                  : setTeacherIds((prev) => [...prev, id])
              }
            />
          </div>
          <DialogFooter>
            <Button
              disabled={addKlassMutation.isPending}
              className={cn(
                addKlassMutation.isPending && "cursor-not-allowed opacity-40",
              )}
              type="submit"
              onClick={handleClick}
            >
              Добавити{" "}
              {addKlassMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#b5b5b5]" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
