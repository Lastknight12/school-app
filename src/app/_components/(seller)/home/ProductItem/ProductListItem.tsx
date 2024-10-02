"use client";

import { type CategoryItem } from "@prisma/client";
import { useState } from "react";
import { GrUpdate } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
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
import { useProducts, useUpdateProduct } from "~/lib/state";
import { cn } from "~/lib/utils";
import AddProduct from "./AddProduct";
import { UpdateProduct } from "./UpdateProduct";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Spinner from "~/components/ui/spinner";

interface Props {
  children: React.ReactNode;
  item: CategoryItem;
}

export default function ProductListItem({ children, item }: Props) {
  const [productCount, setProductCount] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const [updating, setUpdating] = useState(false);

  const itemExist = useProducts((state) => state.productExist(item));

  const removeProduct = useProducts((state) => state.removeProduct);
  const addProduct = useProducts((state) => state.addProduct);

  const initUpdate = useUpdateProduct((state) => state.init);
  const resetUpdate = useUpdateProduct((state) => state.reset);
  const updatedProduct = useUpdateProduct((state) => state.product);

  const utils = api.useUtils();

  const updateProductMutation = api.category.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Продукт успішно оновлено");
      void utils.category.getCategoryItems.invalidate();
    },
    onError: () => {
      toast.error("Помилка під час оновлення продукту");
    },
  });

  const deleteProductMutation = api.category.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("Продукт успішно видалено");
      void utils.category.getCategoryItems.invalidate();
    },
    onError: () => {
      toast.error("Помилка під час видалення продукту");
    },
  });

  const resetStates = () => {
    setProductCount(1);
    setIsOpen(false);
    setUpdating(false);
    resetUpdate();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      // 150 ms for closing animation
      setTimeout(() => {
        resetStates();
      }, 150);
    }
  };

  function handleButtonClick() {
    setTimeout(() => {
      itemExist
        ? removeProduct(item.id)
        : addProduct({ ...item, count: productCount });
    }, 150);

    setIsOpen(false);
  }

  const incrementCount = () => {
    if (productCount < item.count) setProductCount((prev) => prev + 1);
  };

  const decrementCount = () => {
    if (productCount > 1) setProductCount((prev) => prev - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={cn(item.count === 0 && "opacity-30")}>
        {children}
      </DialogTrigger>
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
          {updating ? (
            <UpdateProduct />
          ) : (
            <AddProduct
              item={item}
              remainingCount={item.count}
              decrementCountCallback={decrementCount}
              incrementCountCallback={incrementCount}
              productCount={productCount}
            />
          )}
        </div>

        <DialogFooter className="justify-end gap-2">
          {/* Delete Button */}
          <Button
            disabled={deleteProductMutation.isPending}
            className={cn(deleteProductMutation.isPending && "opacity-30")}
            onClick={() => deleteProductMutation.mutate({ id: item.id })}
          >
            <MdDelete className="text-red-400" />
            {deleteProductMutation.isPending && (
              <Spinner containerClassName=" ml-2" />
            )}
          </Button>

          {/* Update Button */}
          <Button
            onClick={() => {
              if (!updating) initUpdate(item);
              if (updating) resetUpdate();
              setUpdating(!updating);
            }}
          >
            <GrUpdate className="text-yellow-400" />
          </Button>

          {/* Add Button and Update */}
          {!updating ? (
            <Button
              onClick={handleButtonClick}
              className={cn(item.count === 0 && "opacity-30")}
              disabled={item.count === 0}
            >
              {!itemExist
                ? "Додати до списку ✅"
                : `Видалити ${item.title} з списку ❌`}
            </Button>
          ) : (
            <Button
              disabled={updateProductMutation.isPending || !updatedProduct}
              className={cn(updateProductMutation.isPending && "opacity-30")}
              onClick={() =>
                updateProductMutation.mutate({
                  id: item.id,
                  count: updatedProduct.newCount,
                  title: updatedProduct.newTitle,
                  imageSrc: updatedProduct.newImageSrc,
                  price: updatedProduct.newPrice,
                })
              }
            >
              Оновити{" "}
              {updateProductMutation.isPending && (
                <Spinner containerClassName=" ml-2" />
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
