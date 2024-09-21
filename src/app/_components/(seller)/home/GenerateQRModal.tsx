"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "~/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { pusherClient } from "~/lib/pusher-client";
import { api } from "~/trpc/react";
import { ProductCarousel } from "../../(student)/buy/ProductsCarousel";
import { CategoryItem } from "@prisma/client";
import QRCode from "react-qr-code";
import { useProducts } from "~/lib/state";

interface Props {
  products: CategoryItem[];
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function GenerateQRModal({
  products,
  onSuccess,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const resetProductList = useProducts((state) => state.reset);

  const resetStates = () => {
    resetProductList();
    genQRToken.reset();
    setIsSuccess(false);
    setOpen(false);
    setPaymentError("");
  };

  const genQRToken = api.transfers.generateProductToken.useMutation();
  const decrementProductsCount =
    api.category.decrementProductsCount.useMutation();

  console.log(genQRToken.data?.token);

  useEffect(() => {
    if (genQRToken.data) {
      const channel = pusherClient.subscribe(genQRToken.data.channel);

      channel.bind("pay", (data: { error?: string }) => {
        if (data.error) {
          setPaymentError(data.error);
          return;
        }

        setPaymentError("")
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
  }, [genQRToken.data]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          resetStates();
          setOpen(false);
        }

        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="gap-8 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {genQRToken.data ? "Відскануй QR код" : "Список доданих продуктів"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full justify-center">
          {genQRToken.data ? (
            <>
              {!isSuccess && !paymentError && (
                <QRCode value={process.env.VERCEL_URL ?? "localhost:3000" + `/buy?token=${genQRToken.data.token}`} />
              )}
              {paymentError && <p className="text-red-500">{paymentError}</p>}
              {isSuccess && <p className="text-green-500">Успішно</p>}
            </>
          ) : (
            <ProductCarousel items={products} imageSize={100} />
          )}
        </div>
        {!genQRToken.isSuccess && (
          <DialogFooter className="justify-end">
            <Button
              type="submit"
              onClick={() => genQRToken.mutate({ products })}
            >
              Створити QR код
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
