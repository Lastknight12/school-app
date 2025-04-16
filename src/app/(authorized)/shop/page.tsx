"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import getCategoryItems from "~/server/callers/category/items/get";
import getCategoryNames from "~/server/callers/category/names/get";

import { cn } from "~/lib/utils";

import CategoryNamesList from "~/app/_components/shared/CategoryNamesList";
import ProductCard from "~/app/_components/shared/ProductCard";

import { useSidebar } from "~/shadcn/ui/sidebar";

export default function Shop() {
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const categoryNames = getCategoryNames();

  const fetchCategoryItems = getCategoryItems(
    {
      categoryName: currentCategoryName,
      searchFilter: null,
    },
    { enabled: currentCategoryName.length > 0 },
  );

  useEffect(() => {
    if (categoryNames.data?.length === 0 && !categoryNames.isFetching) {
      toast.error("Не вдалося завантажити категорії. Спробуйте пізніше");
    } else if (categoryNames.data && categoryNames.data.length > 0) {
      setCurrentCategoryName(categoryNames.data[0]!.name);
    }
  }, [categoryNames.data, categoryNames.isFetching]);

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
          categories={categoryNames.data ?? []}
          isLoading={categoryNames.isPending}
          onClick={(data) => setCurrentCategoryName(data)}
        />

        {fetchCategoryItems.isPending && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
          </div>
        )}

        {fetchCategoryItems.data?.length === 0 &&
          !fetchCategoryItems.isPending && (
            <p className="text-center">
              Не знайдено жодних продуктів в категорії{" "}
              <span className="text-emerald-300">{currentCategoryName}</span>
            </p>
          )}

        {fetchCategoryItems.data && fetchCategoryItems.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
            {fetchCategoryItems.data
              .sort((a, b) => (a.count > b.count ? -1 : 1))
              .map((item) => {
                return <ProductCard product={item} key={item.id} />;
              })}
          </div>
        )}
      </div>
    </main>
  );
}
