import { cn } from "~/lib/utils";

interface Props {
  onClick?: (name: "users" | "badges" | "transactions") => void;
  activeItem?: string;
}

export default function ModelsList({ onClick, activeItem }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 items-center">
        <div className={cn("bg-accent rounded-lg", activeItem === "users" ? "bg-primary text-primary-foreground" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("users");
            }}
          >
            Users
          </div>
        </div>

        <div className={cn("bg-accent rounded-lg", activeItem === "badges" ? "bg-primary text-primary-foreground" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("badges");
            }}
          >
            Badges
          </div>
        </div>

        <div className={cn("bg-accent rounded-lg", activeItem === "transactions" ? "bg-primary text-primary-foreground" : "")}>
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("transactions");
            }}
          >
            Transactions
          </div>
        </div>
      </div>
    </div>
  );
}
