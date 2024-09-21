"use client";

import { useSearchParams } from "next/navigation";
import { ProductCarousel } from "~/app/_components/(student)/buy/ProductsCarousel";
import { Button } from "~/components/ui/button";
import Spinner from "~/components/ui/spinner";
import { api } from "~/trpc/react";

export default function BuyProduct() {
  const params = useSearchParams();

  const token = params.get("token");

  if (!token) {
    return "Errorpage";
  }

  const payMutation = api.transfers.pay.useMutation();

  const getItemsFromToken = api.category.getItemsByToken.useQuery(
    { token },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  if (getItemsFromToken.error) {
    return (
      <h1 className="w-full text-center">{getItemsFromToken.error.message}</h1>
    );
  }

  if (!getItemsFromToken.data && !getItemsFromToken.isFetching) {
    return <h1>Invalid token</h1>;
  }

  return (
    <main className="flex h-[calc(100vh-72px)] w-full flex-col justify-between pb-2">
      {getItemsFromToken.isFetching ? (
        <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center">
          <Spinner />
        </div>
      ) : payMutation.isSuccess ? (
        <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center">
          <h1 className="text-2xl text-lime-500">Success</h1>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center">
            <ProductCarousel
              items={getItemsFromToken.data!.products}
              className="flex-col text-lg"
            />
          </div>
          <div>
            <h1 className="mb-3 w-full text-center text-xl">
              В суммі: {getItemsFromToken.data!.totalAmount}
            </h1>
            <Button
              variant="green"
              disabled={payMutation.isPending}
              className="flex w-full items-center"
              onClick={() => {
                payMutation.mutate({ token });
              }}
            >
              Оплатити
              {payMutation.isPending && (
                <Spinner
                  className="border-black"
                  containerClassName="ml-2 h-4 w-4"
                />
              )}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
