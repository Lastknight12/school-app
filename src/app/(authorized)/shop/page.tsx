"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import CategoryNamesList from "~/app/_components/shared/CategoryNamesList";
import ProductCard from "~/app/_components/shared/ProductCard";

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

        {getCategoryItems.isPending && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
          </div>
        )}

        {getCategoryItems.data?.length === 0 && !getCategoryItems.isPending && (
          <p className="text-center">
            Не знайдено жодних продуктів в категорі{" "}
            <span className="text-emerald-300">{currentCategoryName}</span>
          </p>
        )}

        {getCategoryItems.data && getCategoryItems.data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
            {getCategoryItems.data
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
