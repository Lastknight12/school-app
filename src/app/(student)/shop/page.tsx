"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import CategoryNamesList from "~/app/_components/shared/CategoryNamesList";

import { useSidebar } from "~/shadcn/ui/sidebar";

export default function Shop() {
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

  const { open, isMobile } = useSidebar();

  return (
    <main>
      <div
        className={cn(
          "flex flex-col gap-5 px-6 transition-all duration-200 ease-linear",
          open && !isMobile && "!w-[calc(100vw-16rem)]",
          isMobile ? "w-screen" : "w-[calc(100vw-24px*2)]",
        )}
      >
        <CategoryNamesList
          categories={getCategoryNames.data ?? []}
          isLoading={getCategoryNames.isPending}
          onClick={setCurrentCategoryName}
        />

        {/* If data is loading show spinner */}
        {getCategoryItems.isPending ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
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
                  "flex items-center gap-3",
                  item.count === 0 && "opacity-30",
                )}
                key={item.id}
              >
                <Image
                  src={item.image}
                  width={100}
                  height={100}
                  className="rounded-md h-[100px]"
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
