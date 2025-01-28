import { Plus, Minus } from "lucide-react";

import { cn } from "~/lib/utils";

interface Props {
  value: number;
  onValueChange: (value: number) => void;
  maxDecrementRange?: number;
  maxIncrementRange?: number;
}

export default function Counter({
  value,
  onValueChange,
  maxDecrementRange,
  maxIncrementRange,
}: Props) {
  return (
    <div className="grid grid-cols-3 items-center justify-center">
      <Minus
        onClick={() =>
          value > (maxDecrementRange ?? 0) && onValueChange(value - 1)
        }
        className={cn(value === (maxDecrementRange ?? 0) && "opacity-50")}
        style={{ width: "100%" }}
      />

      <input
        className="bg-transparent text-center text-xl outline-none select-none"
        value={value}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (!isNaN(value) && value <= (maxIncrementRange ?? Infinity))
            onValueChange(value);
        }}
        style={{ width: "100%" }}
      />

      <Plus
        onClick={() =>
          value < (maxIncrementRange ?? Infinity) && onValueChange(value + 1)
        }
        className={cn(
          value === (maxIncrementRange ?? Infinity) && "opacity-50",
        )}
        style={{ width: "100%" }}
      />
    </div>
  );
}
