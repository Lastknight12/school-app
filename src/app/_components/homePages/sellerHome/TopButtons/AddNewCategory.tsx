import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import addCategory from "~/server/callers/category/add/post";

import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { Input } from "~/shadcn/ui/input";
import { Label } from "~/shadcn/ui/label";

interface Props {
  children: React.ReactNode;
}

export default function AddNewCategory({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");

  const utils = useQueryClient();

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName("");
      }, 150);
    }
  }, [isOpen]);

  const addCategoryMutation = addCategory({
    onSuccess: () => {
      void utils.invalidateQueries({ queryKey: ["getCategoryNames"] });
      toast.success(
        // short title if title is too long
        <p className="text-white">
          Категорію{" "}
          <span className="text-emerald-300">
            {name.length > 10 ? name.slice(0, 10) + "..." : name}
          </span>{" "}
          успішно додано
        </p>,
      );
      setIsOpen(false);
    },
    onError: (error) => {
      // is zod error show first error
      if (typeof error.message === "string") {
        toast.error(error.message);
      } else {
        toast.error(error.message[0]?.message);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Disable auto focus on open */}
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Додати категорію</DialogTitle>
          <DialogDescription>
            Заповніть поля, щоб добавити нову категорію
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* NAME */}
            <Label className="text-left text-base">Назва:</Label>
            <Input
              variant="accent"
              className="col-span-2"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="justify-end">
          <Button
            disabled={addCategoryMutation.isPending}
            onClick={() =>
              addCategoryMutation.mutate({
                categoryName: name,
              })
            }
            type="submit"
          >
            Додати
            {addCategoryMutation.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
