import { cn } from "~/lib/utils";

import { CategoryMenu } from "./CategoryMenu";

import { Skeleton } from "~/shadcn/ui/skeleton";

interface Props {
  onClick?: (name: string) => void;
  isLoading?: boolean;
  categories: {
    name: string;
  }[];
  showMenu?: boolean;
}

export default function CategoryNamesList({
  onClick,
  isLoading,
  categories,
  showMenu,
}: Props) {

  return (
    // if no categories and not loading, hide list
    <div
      className="overflow-x-auto pb-2"
    >
      <div className="flex gap-2">
        {isLoading
          ? Array.from({ length: 40 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[38px] w-[77px] flex-shrink-0"
              />
            ))
          : categories?.map((category) => {
              return (
                <div
                  key={category.name}
                  className="flex items-center bg-card border border-border rounded-[10px] w-max"
                >
                  <div
                    className={cn(
                      "py-2 grow cursor-pointer",
                      !showMenu ? "px-4" : "pl-4",
                    )}
                    onClick={() => {
                      onClick?.(category.name);
                    }}
                  >
                    {category.name}
                  </div>

                  {showMenu && <CategoryMenu categoryName={category.name} />}
                </div>
              );
            })}
      </div>
    </div>
  );
}
