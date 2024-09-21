"use client";

import { CategoryItem } from "@prisma/client";
import { useState } from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { useProducts } from "~/lib/state";
import { cn } from "~/lib/utils";

interface Props {
  children: React.ReactNode;
  item: CategoryItem;
  onButtonClick: (item: CategoryItem) => void;
}

export default function ProductListItem({
  children,
  item,
  onButtonClick,
}: Props) {
  const [productCount, setProductCount] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const itemExist = useProducts((state) => state.productExist(item));

  const resetStates = () => {
    setProductCount(1);
    setIsOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      // 150 ms for closing animation
      setTimeout(() => {
        resetStates();
      }, 150)
    }
  };

  function handleButtonClick() {
    if (itemExist) return;

    setIsOpen(false);
    onButtonClick({ ...item, count: productCount });
  }

  const incrementCount = () => {
    if (productCount < item.count) setProductCount((prev) => prev + 1);
  };

  const decrementCount = () => {
    if (productCount > 1) setProductCount((prev) => prev - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Додати <span className="text-emerald-300">{item.title}</span> до
            списку
          </DialogTitle>

          <DialogDescription>
            Додайте продукт до списку, а потім згенеруйте qr код
          </DialogDescription>
        </DialogHeader>

        <div className="flex select-none items-center justify-center">
          <div className="grid gap-1 py-4">
            <div className="grid grid-cols-3 items-center">
              <Label htmlFor="count" className="text-left text-base">
                Кількість:
              </Label>
              <div className="flex items-center gap-3">
                <IoMdRemove
                  size={35}
                  onClick={decrementCount}
                  className={cn(productCount === 1 && "opacity-50")}
                />
                <h1 className="text-xl">{productCount}</h1>
                <IoMdAdd
                  size={35}
                  onClick={incrementCount}
                  className={cn(productCount === item.count && "opacity-50")}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 items-center">
              <Label htmlFor="price" className="text-left text-base">
                Сумма:
              </Label>
              <h1 className="col-span-2 text-xl">
                {item.pricePerOne * productCount}
              </h1>
            </div>
          </div>
        </div>

        <DialogFooter className="justify-end">
          <Button onClick={handleButtonClick} disabled={itemExist}>
            {!itemExist
              ? "Додати до списку ✅"
              : `${item.title} уже в списку ❌`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
