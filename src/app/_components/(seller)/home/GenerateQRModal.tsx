"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { env } from "~/env";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";
import { useProducts } from "~/lib/state";
import { cn } from "~/lib/utils";

import { ProductCarousel } from "../../shared/Product/ProductsCarousel";

import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";

interface Props {
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function GenerateQRModal({ onSuccess, children }: Props) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const utils = api.useUtils();

  const resetProductList = useProducts((state) => state.reset);

  const products = useProducts((state) => state.products);

  const resetStates = () => {
    resetProductList();
    genQRToken.reset();
    setIsSuccess(false);
    setOpen(false);
    setPaymentError("");
  };

  const genQRToken = api.transfers.generateProductToken.useMutation();

  const decrementProductsCount =
    api.category.decrementProductsCount.useMutation({
      onSuccess: () => {
        void utils.category.getCategoryItems.invalidate();
      },
    });

  useEffect(() => {
    if (genQRToken.data) {
      const channel = pusherClient.subscribe(genQRToken.data.channel);

      channel.bind("pay", (data: { error?: string }) => {
        if (data.error) {
          setPaymentError(data.error);
          setTimeout(() => {
            resetStates();
          }, 1500);

          return;
        }

        setPaymentError("");
        setIsSuccess(true);

        decrementProductsCount.mutate(
          products.map((product) => {
            return {
              id: product.id,
              count: product.count,
            };
          }),
        );

        onSuccess?.();

        setTimeout(() => {
          resetStates();
        }, 1500);
      });
    }

    return () => {
      pusherClient.unsubscribe(genQRToken.data?.channel as string);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genQRToken.data]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          setTimeout(() => {
            genQRToken.reset();
          }, 150);
        }

        // open only if there are products
        products.length > 0 && setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[425px] gap-8",
          genQRToken.data && !isSuccess && !paymentError && "bg-white",
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-center",
              genQRToken.data && !isSuccess && !paymentError && "text-black",
            )}
          >
            {genQRToken.data ? "Відскануй QR код" : "Список доданих продуктів"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full justify-center">
          {genQRToken.data ? (
            <>
              {!isSuccess && !paymentError && (
                <QRCode
                  value={
                    env.NEXT_PUBLIC_BUY_URL + `?token=${genQRToken.data.token}`
                  }
                />
              )}
              {paymentError && <p className="text-red-500">{paymentError}</p>}
              {isSuccess && <p className="text-green-500">Успішно</p>}
            </>
          ) : (
            <ProductCarousel items={products} imageSize={100} />
          )}
        </div>
        <DialogFooter className="justify-end">
          {!genQRToken.isSuccess ? (
            <Button
              disabled={genQRToken.isPending}
              type="submit"
              onClick={() => genQRToken.mutate({ products })}
            >
              Створити QR код
              {genQRToken.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          ) : (
            <DialogClose className="text-black">
              <Button className=" bg-black">Закрити</Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
