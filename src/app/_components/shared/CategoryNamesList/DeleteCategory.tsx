import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { TruncatedText } from "../TruncatedText";

import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

  const utils = api.useUtils();

  const deleteCategoryMutation = api.category.deleteCategory.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryNames.invalidate();
      void utils.category.getCategoryItems.invalidate();
      toast.success(
        <p className="text-white">
          Категорію <TruncatedText text={categoryName} maxLength={10} />
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
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={() =>
          onOpenChange ? onOpenChange(false) : setIsOpen(false)
        }
      >
        <DialogHeader>
          <DialogTitle>
            Видалити{" "}
            <TruncatedText
              className="text-red-500"
              text={categoryName}
              maxLength={15}
            />
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
