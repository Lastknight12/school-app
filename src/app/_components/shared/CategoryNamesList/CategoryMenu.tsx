"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { DeleteCategory } from "./DeleteCategory";
import UpdateCategory from "./UpdateCategory";
import { useState } from "react";

interface Props {
  categoryName: string;
}

export function CategoryMenu({ categoryName }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger className="outline-none">
        <HiDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={(e) => {
            // disable autofocus
            e.preventDefault();
            setIsUpdateOpen(!isUpdateOpen);
          }}
        >
          <UpdateCategory
            categoryName={categoryName}
            open={isUpdateOpen}
            onOpenChange={setIsUpdateOpen}
          />
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setIsDeleteOpen(!isDeleteOpen);
          }}
        >
          <DeleteCategory
            categoryName={categoryName}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
