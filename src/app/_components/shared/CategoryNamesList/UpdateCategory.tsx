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
    categoryName: string
    open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateCategory({ categoryName, open, onOpenChange }: Props) {
  const [isOpen, setIsOpen] = useState(open ?? false);

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

  function handleOpenChange(state: boolean) {
    console.log(open)
    setIsOpen(!state);
    onOpenChange?.(!state);
  }

  const updateCategoryMutation = api.category.updateCategory.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryNames.invalidate();
      toast.success(
        // short title if title is too long
        <p className="text-white">
          Категорію{" "}
          <span className="text-emerald-300">
            {categoryName.length > 10 ? categoryName.slice(0, 10) + "..." : categoryName}
          </span>{" "}
          змінено на 
          <span className="text-emerald-300"> {name.length > 10 ? name.slice(0, 10) + "..." : name}</span>
        </p>,
      );
      setIsOpen(false);
    },
  });

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className=" outline-none">
        Оновити
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Оновити категорію</DialogTitle>
          <DialogDescription>
            Змініть назву категорії
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* New name */}
            <Label className="text-left text-base">Нова назва:</Label>
            <input
              className="col-span-2 rounded-md border-card bg-card px-3 py-1 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
