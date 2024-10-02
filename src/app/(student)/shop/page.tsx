"use client";

import { api } from "~/trpc/react";
import Spinner from "~/components/ui/spinner";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

export default function SellerHomePage() {
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const getCategoryNames = api.category.getCategoryNames.useQuery(void 0, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (getCategoryNames.data?.length === 0 && !getCategoryNames.isFetching) {
      toast.error("Не вдалося завантажити категорії. Спробуйте пізніше");
    } else if (getCategoryNames.data && getCategoryNames.data.length > 0) {
      setCurrentCategoryName(getCategoryNames.data[0]!.name);
    }
  }, [getCategoryNames.data, getCategoryNames.isFetching]);

  const getCategoryItems = api.category.getCategoryItems.useQuery(
    {
      categoryName: currentCategoryName,
    },
    {
      enabled: currentCategoryName !== "",
    },
  );

  return (
    <main>
      <div className="flex h-[calc(100vh-72px)] flex-col gap-5">
        <div className="flex gap-2">
          {getCategoryNames.isPending ? (
            <div className="overflow-x-auto">
              <div className="inline-flex space-x-2 pb-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[38px] w-[77px] flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          ) : (
            getCategoryNames.data?.map((category) => {
              return (
                <div
                  key={category.name}
                  className="rounded-md select-none bg-card px-4 py-2"
                  onClick={() => {
                    setCurrentCategoryName(category.name);
                  }}
                >
                  {category.name}
                </div>
              );
            })
          )}
        </div>
        {/* If data is loading show spinner */}
        {getCategoryItems.isPending ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : // if not loading and data is empty show message
        getCategoryItems.data?.length === 0 ? (
          <p className="text-center">
            Не знайдено жодних продуктів в категорі{" "}
            <span className="text-emerald-300">{currentCategoryName}</span>
          </p>
        ) : (
          // else show items
          getCategoryItems.data?.map((item) => {
            return (
              <div
                className={cn(
                  "flex items-start gap-3",
                  item.count === 0 && "opacity-30",
                )}
                key={item.id}
              >
                <Image
                  src={item.image}
                  width={100}
                  height={100}
                  className="rounded-md"
                  alt="product image"
                />
                <div className="flex flex-col justify-center gap-2">
                  <h1>{item.title}</h1>
                  <p>{item.pricePerOne + " Балів"}</p>
                  <p>Кількість: {item.count}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
