import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { DeleteCategory } from "./DeleteCategory";
import UpdateCategory from "./UpdateCategory";

interface Props {
  categoryName: string;
}

export function CategoryMenu({ categoryName }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <HiDotsVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* when dont prevent default the modal will close instantly after click */}
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UpdateCategory categoryName={categoryName} />
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <DeleteCategory categoryName={categoryName} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
