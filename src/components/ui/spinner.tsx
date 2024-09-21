import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export default function Spinner({ containerClassName, ...props }: Props) {
  return (
    <div className={cn("h-5 w-5", containerClassName)}>
      <div
        className={cn("h-full w-full animate-spin rounded-full border-2 border-[#888888] !border-t-transparent bg-transparent", props.className)}
      />
    </div>
  );
}
