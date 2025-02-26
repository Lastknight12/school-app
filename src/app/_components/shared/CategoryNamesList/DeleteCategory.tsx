import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import deleteCategory from "~/server/callers/category/delete/post";

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

interface Props {
  categoryName: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  triggerClassName?: string;
}

export function DeleteCategory({
  categoryName,
  isOpen: customIsOpen,
  onOpenChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = useQueryClient();

  const deleteCategoryMutation = deleteCategory({
    onSuccess: () => {
      void utils.invalidateQueries({ queryKey: ["getCategoryNames"] });
      toast.success(
        <p className="text-white">
          Категорію{" "}
          <span className="text-emerald-300">
            {categoryName.length > 10
              ? categoryName.slice(0, 10) + "..."
              : categoryName}
          </span>{" "}
          видалено
        </p>,
      );

      setIsOpen(false);
      onOpenChange?.(false);
    },
  });

  return (
    <Dialog
      open={customIsOpen ?? isOpen}
      onOpenChange={(open) => {
        onOpenChange?.(open);
        setIsOpen(open);
      }}
    >
      <DialogTrigger className="text-red-400 outline-none">
        Видалити
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={() =>
          onOpenChange ? onOpenChange(false) : setIsOpen(false)
        }
      >
        <DialogHeader>
          <DialogTitle>
            Видалити{" "}
            <span className="text-red-500">
              {categoryName.length > 15
                ? categoryName.slice(0, 15) + "..."
                : categoryName}
            </span>
            ?
          </DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити категорію та всі продукти в ній?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="justify-end">
          <Button
            disabled={deleteCategoryMutation.isPending}
            className="bg-red-500 text-black"
            onClick={() => {
              deleteCategoryMutation.mutate({ categoryName });
            }}
          >
            Видалити
            {deleteCategoryMutation.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-black" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
