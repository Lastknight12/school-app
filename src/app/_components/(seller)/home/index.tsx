"use client";

import { api } from "~/trpc/react";
import ProductListItem from "./ProductListItem";
import Spinner from "~/components/ui/spinner";
import { useProducts } from "~/lib/state";
import Image from "next/image";

export default function SellerHomePage() {
  const getCategoryItems = api.category.getCategoryItems.useQuery(
    { categoryName: "Їжа" },
    {
      refetchOnWindowFocus: false,
    },
  );

  const addProduct = useProducts((state) => state.addProduct);

  return (
    <main>
      <div className="flex h-[calc(100vh-72px)] flex-col gap-5">
        {getCategoryItems.isFetching && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {getCategoryItems.data?.items.map((item, index) => {
          return (
            <ProductListItem
              key={index}
              item={item}
            >
              <div className="flex items-start gap-3">
                <Image src={item.image} width={100} height={100} className="rounded-md" alt="product image"/>
                <div className="flex flex-col justify-center gap-2">
                  <h1>{item.title}</h1>
                  <p>{item.pricePerOne + " Балів"}</p>
                  <p>Кількість: {item.count}</p>
                </div>
              </div>
            </ProductListItem>
          );
        })}
      </div>
    </main>
  );
}
