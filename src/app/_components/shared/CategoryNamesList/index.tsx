import { cn } from "~/lib/utils";

import { CategoryMenu } from "./CategoryMenu";

import { List, ListContent, ListItem } from "~/shadcn/ui/buttons-list";
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
    <List>
      <ListContent className="pb-2">
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[38px] w-[77px] flex-shrink-0"
              />
            ))
          : categories?.map((category) => {
              return (
                <ListItem key={category.name}>
                  <div
                    className={cn("py-2", !showMenu ? "px-4" : "pl-4")}
                    onClick={() => {
                      onClick?.(category.name);
                    }}
                  >
                    {category.name}
                  </div>

                  {showMenu && <CategoryMenu categoryName={category.name} />}
                </ListItem>
              );
            })}
      </ListContent>
    </List>
  );
}
