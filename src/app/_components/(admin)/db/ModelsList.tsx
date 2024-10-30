import { List, ListContent, ListItem } from "~/shadcn/ui/buttons-list";

interface Props {
  onClick?: (name: "users" | "badges" | "transactions") => void;
}

export default function ModelsList({ onClick }: Props) {
  return (
    <List>
      <ListContent>
        <ListItem>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("users");
            }}
          >
            Users
          </div>
        </ListItem>

        <ListItem>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("badges");
            }}
          >
            Badges
          </div>
        </ListItem>

        <ListItem>
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
