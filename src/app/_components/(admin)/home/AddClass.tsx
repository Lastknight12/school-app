"use client";

import { type User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { addKlassSchema } from "~/schemas/zod";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import SelectUsersModal from "../../shared/SelectUsersModal";

import { Avatar, AvatarFallback, AvatarImage } from "~/shadcn/ui/avatar";
import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { Input } from "~/shadcn/ui/input";

export default function AddClass() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);

  const utils = api.useUtils();

  const [klassName, setKlassName] = useState("");
  const [teachers, setTeachers] = useState<
    Pick<User, "id" | "image" | "name">[]
  >([]);

  const addKlassMutation = api.klass.addKlass.useMutation({
    onSuccess: () => {
      void utils.klass.getAllKlasses.invalidate();
      setIsOpen(false);
      setIsTeachersModalOpen(false);
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  async function handleSubmit() {
    try {
      addKlassSchema.parse({
        name: klassName,
        teacherIds: teachers.map((t) => t.id),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0]!.message, {
          duration: Infinity,
        });
        return;
      }
    }

    addKlassMutation.mutate({
      name: klassName,
      teacherIds: teachers.map((t) => t.id),
    });
  }

  return (
    <div className="mb-5">
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={addKlassMutation.isPending}
          >
            Добавити клас
          </Button>
        </DialogTrigger>
        <DialogContent className="backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Добавити клас</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <Input
              type="text"
              variant="accent"
              value={klassName}
              onChange={(e) => setKlassName(e.target.value)}
              className="mb-3"
              placeholder="Назва класу"
            />

            <SelectUsersModal
              usersType="TEACHER"
              onSubmit={(teachers) => {
                setTeachers(teachers);
                setIsTeachersModalOpen(false);
              }}
              open={isTeachersModalOpen}
              onOpenChange={setIsTeachersModalOpen}
            >
              <Button
                variant="secondary"
                disabled={addKlassMutation.isPending}
                className="max-w-max"
              >
                {teachers.length === 0 ? (
                  <p>Виберіть вчителів</p>
                ) : (
                  <div className="flex items-center gap-2">
                    {teachers.slice(0, 5).map((teacher) => (
                      <Avatar
                        className="h-6 w-6 [&:not(:last-child)]:-ml-2"
                        key={teacher.id}
                      >
                        <AvatarImage src={teacher.image} alt={teacher.name} />
                        <AvatarFallback>{teacher.name}</AvatarFallback>
                      </Avatar>
                    ))}
                    {teachers.slice(0, 5).length > 5 && (
                      <p>+{teachers.slice(0, 5).length}</p>
                    )}
                  </div>
                )}
              </Button>
            </SelectUsersModal>
          </div>
          <DialogFooter>
            <Button
              disabled={addKlassMutation.isPending}
              className={cn(
                addKlassMutation.isPending && "cursor-not-allowed opacity-40",
              )}
              type="submit"
              onClick={handleSubmit}
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
