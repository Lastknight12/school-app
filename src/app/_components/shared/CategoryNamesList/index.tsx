import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { CategoryMenu } from "./CategoryMenu";

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
    // if no categories and not loading, hide the list
    <div
      className={cn(
        "overflow-x-auto",
        categories.length === 0 && !isLoading ? "hidden" : "min-h-min",
      )}
    >
      <div className="inline-flex space-x-2 pb-2">
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[38px] w-[77px] flex-shrink-0"
              />
            ))
          : categories?.map((category) => {
              return (
                <div
                  key={category.name}
                  className="flex flex-shrink-0 items-center gap-2 rounded-md bg-card px-4 py-2"
                >
                  <div
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
