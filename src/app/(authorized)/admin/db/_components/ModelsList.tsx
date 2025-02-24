import { cn } from "~/lib/utils";

interface Props {
  onClick?: (name: "users" | "purchases" | "transactions") => void;
  activeItem?: "users" | "purchases" | "transactions";
}

export default function ModelsList({ onClick, activeItem }: Props) {
  return (
    <div className="overflow-x-auto pb-2 text-sm">
      <div className="flex gap-2 items-center">
        <div
          className={cn(
            "bg-accent rounded-lg cursor-pointer",
            activeItem === "users" ? "bg-primary text-primary-foreground" : "",
          )}
        >
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("users");
            }}
          >
            Користувачі
          </div>
        </div>

        <div
          className={cn(
            "bg-accent rounded-lg cursor-pointer",
            activeItem === "purchases"
              ? "bg-primary text-primary-foreground"
              : "",
          )}
        >
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("purchases");
            }}
          >
            Покупки
          </div>
        </div>

        <div
          className={cn(
            "bg-accent rounded-lg cursor-pointer",
            activeItem === "transactions"
              ? "bg-primary text-primary-foreground"
              : "",
          )}
        >
          <div
            className={"py-2 px-4"}
            onClick={() => {
              onClick?.("transactions");
            }}
          >
            Перекази
          </div>
        </div>
      </div>
    </div>
  );
}
