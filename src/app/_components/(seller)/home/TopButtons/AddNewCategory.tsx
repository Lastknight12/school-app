import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

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
import { Label } from "~/shadcn/ui/label";

export default function AddNewCategory() {
  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");

  const utils = api.useUtils();

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setName("");
      }, 150);
    }
  }, [isOpen]);

  const addCategoryMutation = api.category.addCategory.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryNames.invalidate();
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
      error.data?.zodError && error.data?.zodError.length > 0
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-grow">Додати категорію</Button>
      </DialogTrigger>
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
            <input
              className="col-span-2 rounded-md border-card bg-card px-3 py-1 outline-none"
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
