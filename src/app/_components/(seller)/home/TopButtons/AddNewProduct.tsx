import { Label } from "~/components/ui/label";
import UploadImage from "../../../shared/UploadImage";
import { useEffect, useState } from "react";
import Counter from "~/components/ui/counter";
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
import { addProductSchema } from "~/schemas/zod";
import { ZodError } from "zod";
import { Loader2 } from "lucide-react";

interface Props {
  currentCategoryName: string;
}

export default function AddNewProduct({ currentCategoryName }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [count, setCount] = useState(0);
  const [price, setPrice] = useState(0);
  const [imageSrc, setImageSrc] = useState("");

  const utils = api.useUtils();

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setCount(0);
        setPrice(0);
        setImageSrc("");
      }, 150);
    }
  }, [isOpen]);

  const addProductMutation = api.category.addProduct.useMutation({
    onSuccess: () => {
      void utils.category.getCategoryItems.invalidate({
        categoryName: currentCategoryName,
      });
      toast.success(
        // short title if title is too long
        <p className="text-white">
          Продукт{" "}
          <span className="text-emerald-300">
            {title.length > 10 ? title.slice(0, 10) + "..." : title}
          </span>{" "}
          успішно додано
        </p>,
      );
      setIsOpen(false);
    },
    onError: (error) => {
      error.data?.zodError && error.data?.zodError.length > 0
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  function handleClick() {
    try {
      addProductSchema.parse({
        title,
        count,
        price,
        imageSrc,
        category: currentCategoryName,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(error.issues[0]!.message);
        return;
      }
    }

    addProductMutation.mutate({
      title,
      count,
      price,
      imageSrc,
      category: currentCategoryName,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-grow">Додати продукт</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Додати продукт</DialogTitle>
          <DialogDescription>
            Заповніть поля, щоб добавити новий продукт в поточну категорію:{" "}
            <span className="text-emerald-300">{currentCategoryName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="grid grid-cols-3 items-center">
            {/* NAME */}
            <Label className="text-left text-base">Назва:</Label>
            <input
              className="col-span-2 rounded-md border-card bg-card px-3 py-1 outline-none"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 items-center">
            {/* COUNT */}
            <Label className="text-left text-base">Кількість</Label>
            <Counter
              value={count}
              onValueChange={setCount}
              maxIncrementRange={999}
            />
          </div>

          <div className="grid grid-cols-3 items-center">
            {/* PRICE */}
            <Label className="text-left text-base">Ціна</Label>
            <Counter
              value={price}
              onValueChange={setPrice}
              maxIncrementRange={999}
            />
          </div>

          <div className="grid grid-cols-3 items-center">
            {/* IMAGE */}
            <Label className="text-left text-base">Картинка</Label>
            <UploadImage onSuccess={setImageSrc} defaultImageSrc={imageSrc} />
          </div>
        </div>
        <DialogFooter className="justify-end">
          <Button
            disabled={addProductMutation.isPending}
            onClick={handleClick}
            type="submit"
          >
            Додати
            {addProductMutation.isPending && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
