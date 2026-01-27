"use client";

import { Download, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";
import { useProducts } from "~/lib/state";
import { cn } from "~/lib/utils";

import { TruncatedText } from "../../shared/TruncatedText";

import { Button } from "~/shadcn/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/shadcn/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shadcn/ui/select";

interface Props {
  onSuccess?: () => void;
  children: React.ReactNode;
}

type qrType = "expires" | "infinity";

export default function GenerateQRModal({ onSuccess, children }: Props) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [qrType, setQrType] = useState<qrType>("expires");

  const products = useProducts((state) => state.products);
  const resetProducts = useProducts((state) => state.reset);
  const removeProduct = useProducts((state) => state.removeProduct);

  const resetStates = () => {
    genQRToken.reset();
    setIsSuccess(false);
    setOpen(false);
    setPaymentError("");
    setQrType("expires");
  };

  useEffect(() => {
    if (products.length === 0) {
      resetStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const genQRToken = api.transfers.genProductToken.useMutation({
    onError: (error) => {
      error.data?.zodError && error.data?.zodError.length > 0
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  // maybe wrap it into onSuccess callback in mutation
  useEffect(() => {
    if (genQRToken.data?.channel) {
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

        onSuccess?.();

        setTimeout(() => {
          resetProducts();
          resetStates();
        }, 1500);
      });
    }

    return () => {
      if (genQRToken.data?.channel) {
        pusherClient.unsubscribe(genQRToken.data.channel);
      }
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
            resetStates();
          }, 150);
        }

        products.length > 0 && setOpen(isOpen);
      }}
    >
      <DialogTrigger disabled={products.length === 0} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="gap-8">
        <DialogHeader>
          <DialogTitle className={cn("text-center")}>
            {genQRToken.data ? "Відскануй QR код" : "Список доданих продуктів"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex w-full">
          {genQRToken.data ? (
            <>
              {!isSuccess && !paymentError && (
                <div className="bg-white p-2 mx-auto">
                  <Image
                    src={genQRToken.data.qr}
                    width={250}
                    height={250}
                    alt="qr code"
                  />
                </div>
              )}
              {paymentError && (
                <p className="text-red-500 mx-auto">{paymentError}</p>
              )}
              {isSuccess && <p className="text-green-500 mx-auto">Успішно</p>}
            </>
          ) : (
            // Products list
            <Carousel className="w-full max-w-[377px] gap-8">
              <CarouselContent>
                {products.map((item) => (
                  <CarouselItem key={item.title} className="relative">
                    <Button
                      className="absolute top-0 right-0 z-10 h-auto p-2"
                      onClick={() => removeProduct(item.id)}
                    >
                      <X />
                    </Button>

                    <div>
                      <div className="flex gap-3 justify-center select-none items-center max-mobile:flex-col max-[410px]:flex-col">
                        <Image
                          src={item.image}
                          width={100}
                          height={100}
                          className="rounded-lg h-[100px]"
                          alt={`${item.title} image`}
                        />

                        <div className="flex flex-col justify-center gap-2">
                          <TruncatedText text={item.title} maxLength={15} />

                          <p className="text-white/70">
                            Ціна: {item.pricePerOne + " Балів"}
                          </p>
                          <p className="text-white/70">
                            Кількість: {item.count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-end gap-4 mt-3">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          )}
        </div>
        <DialogFooter className="justify-end items-center gap-3 flex-wrap flex-row">
          {!genQRToken.isSuccess ? (
            <>
              <Select
                defaultValue={qrType}
                value={qrType}
                onValueChange={(value: qrType) => setQrType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="infinity">Нескінченний</SelectItem>
                    <SelectItem value="expires">З певним треміном</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                disabled={genQRToken.isPending}
                type="submit"
                onClick={() =>
                  genQRToken.mutate({
                    products,
                    type: qrType as "expires" | "infinity",
                  })
                }
              >
                Створити QR код
                {genQRToken.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#b5b5b5]" />
                )}
              </Button>
            </>
          ) : (
            <>
              {genQRToken.data && (
                <a href={genQRToken.data.qr} target="_blank" download>
                  <Button variant="secondary">
                    <Download />
                  </Button>
                </a>
              )}

              <DialogClose asChild>
                <Button>Закрити</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
