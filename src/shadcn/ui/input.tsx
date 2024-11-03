import * as React from "react"

import { cn } from "~/lib/utils"

type InputVariant = "default" | "accent"

const inputVariants: Record<InputVariant, string> = {
  default: "bg-background text-foreground",
  accent: "bg-accent text-accent-foreground",
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
          inputVariants[variant]
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
