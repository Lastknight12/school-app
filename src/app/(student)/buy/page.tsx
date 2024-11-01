"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { ProductCarousel } from "~/app/_components/shared/Product/ProductsCarousel";

import { Button } from "~/shadcn/ui/button";

export default function BuyProduct() {
  const params = useSearchParams();

  const token = params.get("token");
  const productId = params.get("productId");

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
          <h1 className="text-2xl text-lime-500">Успішно</h1>
        </div>
      ) : (
        getItemsFromTokenOrId.data && (
          <>
            <div className="flex flex-col items-center">
              <ProductCarousel
                items={getItemsFromTokenOrId.data.products}
                className="flex-col text-lg"
              />
            </div>
            <div>
              <h1 className="mb-3 w-full text-center text-xl">
                В суммі: {getItemsFromTokenOrId.data.totalAmount}
              </h1>
              <Button
                disabled={payMutation.isPending}
                className="flex w-full items-center text-black bg-lime-500 hover:opacity-70"
                onClick={() => {
                  payMutation.mutate({ token, productId });
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
