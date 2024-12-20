"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/shadcn/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/shadcn/ui/carousel";

import Image from "next/image";
import { env } from "~/env";

export default function BuyProduct() {
  const params = useSearchParams();

  const token = params.get("token");
  const productId = params.get("productId");

  const url = `${env.NEXT_PUBLIC_BUY_URL}?${token ?? productId}`

  if (!productId && !token) {
    return (
      <h1 className="w-full text-center text-red-400">
        Відсутній токен або id продукту
      </h1>
    );
  }

  const payMutation = api.transfers.pay.useMutation({
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  const getItemsFromTokenOrId = api.category.getItemsByTokenOrId.useQuery(
    { token, productId },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  );

  if (getItemsFromTokenOrId.error) {
    getItemsFromTokenOrId.error.data?.zodError &&
      getItemsFromTokenOrId.error.data?.zodError.length > 0 &&
      toast.error(getItemsFromTokenOrId.error.data.zodError[0]!.message);

    return (
      <h1 className="w-full text-center text-red-400">
        {getItemsFromTokenOrId.error.message}
      </h1>
    );
  }

  if (!getItemsFromTokenOrId.data && !getItemsFromTokenOrId.isFetching) {
    return <h1>Невіриний токен або id продукту</h1>;
  }

  return (
    <main className="flex h-[calc(100vh-72px)] w-full flex-col justify-between pb-2 px-6">
      {getItemsFromTokenOrId.isFetching ? (
        <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        </div>
      ) : payMutation.isSuccess ? (
        <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center">
          <h1 className="text-2xl text-lime-500">
            Успішно куплено продукти:{" "}
            {getItemsFromTokenOrId.data?.products
              .map((item) =>
                item.title.length > 15
                  ? item.title.slice(0, 15) + "..."
                  : item.title,
              )
              .join(", ")}
              <br />
              <br />
              Дата покупки: {new Date().toLocaleString()}
          </h1>
        </div>
      ) : (
        getItemsFromTokenOrId.data && (
          <>
            <div className="flex flex-col items-center">
              <Carousel className="w-full max-w-[377px] gap-8">
                <CarouselPrevious className="z-10 left-0" />
                <CarouselContent>
                  {getItemsFromTokenOrId.data.products.map((item) => (
                    <CarouselItem key={item.title}>
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
                            <h1>
                              {item.title.length > 15
                                ? item.title.slice(0, 15) + "..."
                                : item.title}
                            </h1>
                            <p>Ціна: {item.pricePerOne + " Балів"}</p>
                            <p>Кількість: {item.count}</p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext className="z-10 right-0" />
              </Carousel>
            </div>
            <div>
              <h1 className="mb-3 w-full text-center text-xl">
                В суммі: {getItemsFromTokenOrId.data.totalAmount}
              </h1>
              <Button
                disabled={payMutation.isPending || payMutation.isError}
                className="flex w-full items-center text-black bg-lime-500 hover:bg-lime-500 hover:opacity-70 transition-opacity"
                onClick={() => {
                  payMutation.mutate({ url });
                }}
              >
                Оплатити
                {payMutation.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </>
        )
      )}
    </main>
  );
}
