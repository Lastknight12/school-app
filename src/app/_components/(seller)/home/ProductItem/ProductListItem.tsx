"use client";

import { type CategoryItem } from "@prisma/client";
import { useEffect, useState } from "react";
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
import AddProductInList from "./AddProductInList";
import { UpdateProduct } from "./UpdateProduct";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { Loader2 } from "lucide-react";

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

  // set item to update
  const initUpdate = useUpdateProduct((state) => state.init);
  // reset item to update
  const resetUpdate = useUpdateProduct((state) => state.reset);
  // updated item from state
  const updatedProduct = useUpdateProduct((state) => state.product);

  const utils = api.useUtils();

  const updateProductMutation = api.category.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Продукт успішно оновлено");
      void utils.category.getCategoryItems.invalidate();
        setIsOpen(false);
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

  // if close modal reset all states
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        resetStates();
      }, 150);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <UpdateProduct defaultImageSrc={item.image} />
          ) : (

            // TODO: rename it
            <AddProductInList
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
            {deleteProductMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#b5b5b5]" />
            ) : (
              <MdDelete className="text-red-400" size={18} />
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
            {updating ? (
              <IoMdClose className="text-yellow-300" size={20} />
            ) : (
              <GrUpdate className="text-yellow-300" />
            )}
          </Button>

          {/* Add Button and Update */}
          {!updating ? (
            <Button
              onClick={handleButtonClick}
              className={cn(item.count === 0 && "opacity-30")}
              disabled={item.count === 0}
            >
              {item.count === 0
                ? "Немає в наявності ❌"
                : !itemExist
                  ? "Додати до списку ✅"
                  : `Видалити з списку ❌`}
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
                <Loader2 className="ml-2 h-4 w-4 animate-spin bg-[#b5b5b5]" />
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
