import { type HTMLProps } from "react";

import { cn } from "~/lib/utils";

interface ButtonListProps {
  children: React.ReactNode;
  className?: HTMLProps<HTMLDivElement>["className"];
}
export const List = ({ children, className }: ButtonListProps) => {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
};

interface ListContentProps {
  children: React.ReactNode;
  className?: HTMLProps<HTMLDivElement>["className"];
}

export const ListContent = ({ children, className }: ListContentProps) => {
  return <div className={cn("inline-flex space-x-2 pb-2", className)}>{children}</div>;
};

interface ListitemProps {
  children: React.ReactNode;
  className?: HTMLProps<HTMLDivElement>["className"];
}
export const ListItem = ({ children, className }: ListitemProps) => {
  return (
    <div className={cn("flex flex-shrink-0 select-none items-center gap-2 border border-[#484848] rounded-md bg-card", className)}>
      {children}
    </div>
  );
};
