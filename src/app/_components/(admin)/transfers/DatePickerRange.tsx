"use client";

import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { type DateRange } from "react-day-picker";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";
import { Calendar } from "~/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/shadcn/ui/popover";

interface Props {
  onSelect?: (date: { from: string; to?: string }) => void;
}

export default function DatePickerRange({ onSelect }: Props) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 10, 10),
    to: addDays(new Date(2024, 10, 10), 1),
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (date && date.from) {
      onSelect?.({
        from: format(date.from, "yyyy-MM-dd"),
        to: date.to ? format(date.to, "yyyy-MM-dd") : undefined,
      });
    }
  }, [date, onSelect]);

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon size={16} className="mr-2" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Виберіть дату</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
