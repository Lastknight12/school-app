import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

interface Props {
  categoryName: string;
}

export function DeleteCategory({ categoryName }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();

  const deleteCategoryMutation = api.category.deleteCategory.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryNames.invalidate();
      void utils.category.getCategoryItems.invalidate();
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
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-red-400">Видалити</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
        <DialogFooter className="justify-center">
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
