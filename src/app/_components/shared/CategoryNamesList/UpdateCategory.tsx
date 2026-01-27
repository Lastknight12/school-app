import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "~/shadcn/ui/input";
import { Label } from "~/shadcn/ui/label";

interface Props {
  categoryName: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function UpdateCategory({
  categoryName,
  isOpen: customIsOpen,
  onOpenChange,
}: Props) {
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

  const updateCategoryMutation = api.category.updateCategory.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryNames.invalidate();
      toast.success(
        // short title if title is too long
        <p className="text-white">
          Категорію{" "}
          <TruncatedText
            className="text-emerald-300"
            text={categoryName}
            maxLength={10}
          />{" "}
          змінено на{" "}
          <TruncatedText
            className="text-emerald-300"
            text={name}
            maxLength={10}
          />
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Оновити категорію</DialogTitle>
          <DialogDescription>Змініть назву категорії</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-3">
          <Label className="text-left text-base">Нова назва:</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.stopPropagation();
              }
            }}
          />
        </div>
        <DialogFooter className="justify-end">
          <Button
            disabled={updateCategoryMutation.isPending || name.length === 0}
            onClick={() =>
              updateCategoryMutation.mutate({
                categoryName,
                newName: name,
              })
            }
            type="submit"
          >
            Оновити
            {updateCategoryMutation.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
