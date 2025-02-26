"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import getAllTransactions from "~/server/callers/transfers/all/get";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/ui/table";

export default function UsersModelContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const {
    data: transactions,
    isFetching: isFetchingTransactions,
    refetch: refetchTransactions,
  } = getAllTransactions();

  // Pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions?.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction,
  );
  const totalPages = transactions
    ? Math.ceil(transactions.length / transactionsPerPage)
    : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-2 space-x-2 w-max">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchTransactions()}
            disabled={isFetchingTransactions}
          >
            <RefreshCw
              className={cn(isFetchingTransactions && "animate-spin")}
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

      <Table className="mb-4">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead className=" cursor-pointer">Reciever</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetchingTransactions && (
            <TableRow>
              <TableCell colSpan={4}>
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#b5b5b5]" />
              </TableCell>
            </TableRow>
          )}

          {!isFetchingTransactions && transactions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <div className="text-center">Жодних транзакцій не знайдено</div>
              </TableCell>
            </TableRow>
          )}

          {currentTransactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </TableCell>

              <TableCell>{transaction.sender?.name}</TableCell>
              <TableCell>{transaction.reciever?.name}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
