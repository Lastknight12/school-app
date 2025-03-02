import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import { DeleteCategory } from "./DeleteCategory";
import UpdateCategory from "./UpdateCategory";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";

interface Props {
  categoryName: string;
}

export function CategoryMenu({ categoryName }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <UpdateCategory
        categoryName={categoryName}
        isOpen={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
      />
      <DeleteCategory
        categoryName={categoryName}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none py-2 pr-4 ml-2">
          <EllipsisVertical size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onInteractOutside={(e) =>
            (isUpdateOpen || isDeleteOpen) && e.preventDefault()
          }
        >
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsUpdateOpen(true);
            }}
          >
            Оновити
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsDeleteOpen(true);
            }}
            className=" text-destructive"
          >
            Видалити
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
