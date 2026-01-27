"use client";

import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import DatePickerRange from "./DatePickerRange";
import { TransfersTable } from "./PurchasesTable";

import { Button } from "~/shadcn/ui/button";

export default function PurchasesTableContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [dateRange, setDateRange] = useState<{ from: string; to?: string }>({
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(addDays(new Date(), 1), "yyyy-MM-dd"),
  });

  const getTransfers = api.transfers.getTransfersByPeriod.useQuery(
    {
      range: {
        from: startOfDay(dateRange.from),
        to: dateRange.to ? endOfDay(dateRange.to) : undefined,
      },
    },
    {
      gcTime: 0,
    },
  );

  const indexOfLastPurchase = currentPage * usersPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - usersPerPage;
  const currentPurchases = getTransfers.data?.transfers?.slice(
    indexOfFirstPurchase,
    indexOfLastPurchase,
  );

  const totalPages = getTransfers.data
    ? Math.ceil(getTransfers.data.transfers.length / usersPerPage)
    : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between flex-wrap mb-4">
        <DatePickerRange onSelect={setDateRange} />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 space-x-2 w-max">
            <Button
              size="sm"
              variant="outline"
              onClick={() => getTransfers.refetch()}
              disabled={getTransfers.isFetching}
            >
              <RefreshCw
                className={cn(getTransfers.isFetching && "animate-spin")}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              {totalPages > 0
                ? `Page ${currentPage} of ${totalPages}`
                : "Loading..."}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <TransfersTable
        data={currentPurchases}
        totalAmount={getTransfers.data?.totalAmount}
        isFetching={getTransfers.isFetching}
        range={dateRange}
      />
    </div>
  );
}
