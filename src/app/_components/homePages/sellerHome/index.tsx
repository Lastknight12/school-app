"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { useDebounceValue } from "~/hooks/use-debounce-value";

import CategoryNamesList from "../../shared/CategoryNamesList";
import ProductCard from "../../shared/ProductCard";
import GenerateQRModal from "./GenerateQRModal";
import ProductListItem from "./ProductItem";
import AddNewCategory from "./TopButtons/AddNewCategory";
import AddNewProduct from "./TopButtons/AddNewProduct";

import { Button } from "~/shadcn/ui/button";
import { Input } from "~/shadcn/ui/input";
import { useSidebar } from "~/shadcn/ui/sidebar";

export default function SellerHomePage() {
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const getCategoryNames = api.category.getCategoryNames.useQuery(void 0, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const utils = api.useUtils();

  useEffect(() => {
    if (getCategoryNames.data && getCategoryNames.data.length > 0) {
      setCurrentCategoryName(getCategoryNames.data[0]!.name);
    }
  }, [getCategoryNames.data, getCategoryNames.isFetching]);

  const [searchFilter, setSearchFilter] = useState("");
  const debauncedFilterValue = useDebounceValue(searchFilter, 800);

  const getCategoryItems = api.category.getCategoryItems.useQuery(
    {
      categoryName: currentCategoryName,
      searchFilter: debauncedFilterValue,
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
        <div className="flex flex-wrap justify-end gap-3 w-full">
          <GenerateQRModal
            onSuccess={() => void utils.category.getCategoryItems.invalidate()}
          >
            <Button className="grow">Генерувати QR-код</Button>
          </GenerateQRModal>

          <AddNewCategory>
            <Button className="grow">Додати категорію</Button>
          </AddNewCategory>

          <AddNewProduct currentCategoryName={currentCategoryName}>
            <Button className="grow">Додати продукт</Button>
          </AddNewProduct>
        </div>

        {getCategoryNames.data?.length === 0 && !getCategoryNames.isLoading && (
          <p>Не знайдено жодних категорій. Спробуйте добавити нову</p>
        )}

        <CategoryNamesList
          categories={getCategoryNames.data ?? []}
          isLoading={getCategoryNames.isPending}
          onClick={setCurrentCategoryName}
          showMenu
        />

        <div className="flex flex-col gap-2">
          <Input
            className="mb-2"
            value={searchFilter}
            placeholder="Пошук..."
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          {getCategoryItems.isFetching && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
            </div>
          )}

          {getCategoryItems.data?.length === 0 &&
            !getCategoryItems.isPending && (
              <p className="text-center">
                Не знайдено жодних продуктів в категорії{" "}
                <span className="text-emerald-300">{currentCategoryName}</span>
              </p>
            )}

          {getCategoryItems.data?.length === 0 &&
            !getCategoryItems.isPending && (
              <p className="text-center">
                Не знайдено жодних продуктів в категорії{" "}
                <span className="text-emerald-300">{currentCategoryName}</span>
              </p>
            )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
            {getCategoryItems.data
              ?.sort((a, b) => (a.count > b.count ? -1 : 1))
              ?.map((item) => {
                return (
                  <ProductListItem key={item.id} item={item}>
                    <ProductCard product={item} />
                  </ProductListItem>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
