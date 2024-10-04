import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
          <span className="text-emerald-300">
            {categoryName.length > 10
              ? categoryName.slice(0, 10) + "..."
              : categoryName}
          </span>{" "}
          змінено на
          <span className="text-emerald-300">
            {" "}
            {name.length > 10 ? name.slice(0, 10) + "..." : name}
          </span>
        </p>,
      );

      setIsOpen(false);
      onOpenChange?.(false);
    },
  });

  return (
    <Dialog
      // here
      open={customIsOpen ?? isOpen}
      onOpenChange={(open) => {
        onOpenChange?.(open);
        setIsOpen(open);
      }}
    >
      <DialogTrigger className="select-none outline-none">
        Оновити
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={() =>
          customIsOpen ? onOpenChange?.(false) : setIsOpen(false)
        }
      >
        <DialogHeader>
          <DialogTitle>Оновити категорію</DialogTitle>
          <DialogDescription>Змініть назву категорії</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* New name */}
            <Label className="text-left text-base">Нова назва:</Label>
            <input
              className="col-span-2 rounded-md bg-card px-3 py-1 outline-none"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
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
