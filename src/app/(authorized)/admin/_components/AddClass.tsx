"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { addKlassSchema } from "~/schemas/zod";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

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

  const utils = api.useUtils();

  const [klassName, setKlassName] = useState("");

  const addKlassMutation = api.klass.addKlass.useMutation({
    onSuccess: () => {
      void utils.klass.getAllKlasses.invalidate();
      setIsOpen(false);
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
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0]!.message);
        return;
      }
    }

    addKlassMutation.mutate({
      name: klassName,
    });
  }

  return (
    <div className="mb-5">
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogTrigger asChild>
          <Button disabled={addKlassMutation.isPending}>Додати клас</Button>
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
