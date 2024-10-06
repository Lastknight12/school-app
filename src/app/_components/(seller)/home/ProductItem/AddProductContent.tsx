import React from "react";
import { Label } from "~/components/ui/label";
import {type CategoryItem } from "@prisma/client";
import Counter from "~/components/ui/counter";

interface Props {
  onCountChange: (value: number) => void;
  productCount: number;
  item: CategoryItem;
  remainingCount: number;
}

export default function AddProductInList({
  productCount,
  remainingCount,
  item,
  onCountChange: updateCount,
}: Props) {
  return (
    <div className="grid gap-1 py-4">
      <div className="grid grid-cols-3 items-center">
        <Label htmlFor="count" className="text-left text-base">
          Кількість:
        </Label>
        <Counter
          value={productCount}
          onValueChange={updateCount}
          maxIncrementRange={remainingCount}
        />
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
