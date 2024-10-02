import React from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import {type CategoryItem } from "@prisma/client";

interface Props {
  decrementCountCallback: () => void;
  incrementCountCallback: () => void;
  productCount: number;
  item: CategoryItem;
  remainingCount: number;
}

export default function AddProduct({
  productCount,
  remainingCount,
  item,
  incrementCountCallback,
  decrementCountCallback,
}: Props) {
  return (
    <div className="grid gap-1 py-4">
      <div className="grid grid-cols-3 items-center">
        <Label htmlFor="count" className="text-left text-base">
          Кількість:
        </Label>
        <div className="flex items-center gap-3">
          <IoMdRemove
            size={35}
            onClick={decrementCountCallback}
            className={cn(productCount === 1 && "opacity-50")}
          />
          <h1 className="text-xl">{productCount}</h1>
          <IoMdAdd
            size={35}
            onClick={incrementCountCallback}
            className={cn(productCount === remainingCount && "opacity-50")}
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
  );
}
