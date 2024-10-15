"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useDebounceValue } from "~/hooks/useDebounceValue";

import CategoryNamesList from "../../shared/CategoryNamesList";
import ProductListItem from "./ProductItem/ProductListItem";
import AddNewCategory from "./TopButtons/AddNewCategory";
import AddNewProduct from "./TopButtons/AddNewProduct";

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

  return (
    <main>
      <div className="flex h-[calc(100vh-72px)] flex-col gap-5 px-6">
        <div className="flex flex-wrap gap-3">
          <AddNewCategory />

          <AddNewProduct currentCategoryName={currentCategoryName} />
        </div>

        {/* Top scrollable categories list */}
        <CategoryNamesList
          categories={getCategoryNames.data ?? []}
          isLoading={getCategoryNames.isPending}
          onClick={setCurrentCategoryName}
          showMenu
        />

        {/* if we not fetching and data is not empty show input */}
        {(getCategoryNames.data?.length ?? 1) > 0 &&
          !getCategoryNames.isFetching && (
            <input
              className="w-full rounded-md bg-card px-4 py-2 outline-none"
              value={searchFilter}
              disabled={getCategoryNames.isFetching}
              placeholder="Пошук..."
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          )}

        {/* if loading show spinner */}
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
              <ProductListItem key={item.id} item={item}>
                <div className="flex items-center gap-3">
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
              </ProductListItem>
            );
          })
        )}
      </div>
    </main>
  );
}
