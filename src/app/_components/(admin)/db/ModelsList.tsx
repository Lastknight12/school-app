import { cn } from "~/lib/utils";
import { List, ListContent, ListItem } from "~/shadcn/ui/buttons-list";

interface Props {
  onClick?: (name: "users" | "badges" | "transactions") => void;
  activeItem?: string;
}

export default function ModelsList({ onClick, activeItem }: Props) {
  return (
    <List>
      <ListContent>
        <ListItem className={cn(activeItem === "users" ? "bg-[#000]" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("users");
            }}
          >
            Users
          </div>
        </ListItem>

        <ListItem className={cn(activeItem === "badges" ? "bg-[#000]" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("badges");
            }}
          >
            Badges
          </div>
        </ListItem>

        <ListItem className={cn(activeItem === "transactions" ? "bg-[#000]" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("transactions");
            }}
          >
            Transactions
          </div>
        </ListItem>
      </ListContent>
    </List>
  );
}
