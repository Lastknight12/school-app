import type { HTMLAttributes } from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
}

export default function Spinner({ containerClassName, ...props }: Props) {
  return (
    <div className={`${containerClassName} h-5 w-5`}>
      <div
        className={`h-full w-full animate-spin rounded-full border-2 border-[#888888] border-t-transparent bg-transparent ${props.className}`}
        {...props}
      />
    </div>
  );
}
