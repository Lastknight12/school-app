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
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none py-2 pr-4">
        <HiDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onEscapeKeyDown={(e) => {
          (isUpdateOpen || isDeleteOpen) && e.preventDefault();
        }}
      >
        {/* when dont prevent default the modal will close instantly after click */}
        {/* Also if user slick outside modal with touchpad press, it will close and open again. Idk how to fix this */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            // if dont check, the close button in modal will not work
            !isUpdateOpen && setIsUpdateOpen(true);
          }}
        >
          <UpdateCategory
            categoryName={categoryName}
            isOpen={isUpdateOpen}
            onOpenChange={(isOpen) => setIsUpdateOpen(isOpen)}
          />
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            !isDeleteOpen && setIsDeleteOpen(true);
          }}
        >
          <DeleteCategory
            categoryName={categoryName}
            isOpen={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}