import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { addProductSchema } from "~/schemas/zod";

import addProduct from "~/server/callers/category/product/add/post";

import UploadImage from "../../../shared/UploadImage";

import { Button } from "~/shadcn/ui/button";
import Counter from "~/shadcn/ui/counter";
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
  currentCategoryName: string;
  children: React.ReactNode;
}

export default function AddNewProduct({
  currentCategoryName,
  children,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [count, setCount] = useState(0);
  const [price, setPrice] = useState(0);
  const [imageSrc, setImageSrc] = useState("");

  const utils = useQueryClient();

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

  const addProductMutation = addProduct({
    onSuccess: () => {
      void utils.invalidateQueries({ queryKey: ["getCategoryItems"] });
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
      if (typeof error.message === "string") {
        toast.error(error.message);
      } else {
        toast.error(error.message[0]?.message);
      }
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Додати продукт</DialogTitle>
          <DialogDescription>
            Заповніть поля, щоб добавити новий продукт в категорію{" "}
            <span className="text-emerald-300">{currentCategoryName}</span>
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
