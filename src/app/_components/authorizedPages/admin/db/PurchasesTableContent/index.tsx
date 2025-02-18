"use client";

import { addDays, format } from "date-fns";
import { useState } from "react";

import DatePickerRange from "./DatePickerRange";
import { TransfersTable } from "./PurchasesTable";

export default function PurchasesTableContent() {
  const [dateRange, setDateRange] = useState<{ from: string; to?: string }>({
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(addDays(new Date(), 1), "yyyy-MM-dd"),
  });

  return (
    <div className="mb-4">
      <div className="flex gap-3 flex-wrap mb-4">
        <DatePickerRange onSelect={setDateRange} />
      </div>
      <TransfersTable range={dateRange} />
    </div>
  );
}
