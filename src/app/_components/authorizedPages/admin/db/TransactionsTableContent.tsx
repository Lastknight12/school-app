"use client";

import { Loader2, MoreHorizontal, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";
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
  const [transactionsPerPage] = useState(10);
  const utils = api.useUtils();

  const {
    data: transactions,
    isFetching: isFetchingTransactions,
    refetch: refetchTransactions,
  } = api.transfers.getAllTransactions.useQuery();

  const deleteTransactionMutation = api.transfers.deleteTransaction.useMutation(
    {
      onSuccess: () => {
        void utils.transfers.getAllTransactions.invalidate();
        toast.success("Транзакцію видалено");
      },

      onError: () => {
        toast.error("Виникла помилка під час видалення транзакції");
      },
    },
  );

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
            <TableHead className="w-[200px]">Date</TableHead>
            <TableHead className="w-[300px]">Amount</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead className="w-[150px] cursor-pointer">Reciever</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetchingTransactions && (
            <TableRow>
              <TableCell colSpan={5}>
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#b5b5b5]" />
              </TableCell>
            </TableRow>
          )}

          {!isFetchingTransactions && transactions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="text-center">Жодних транзакцій не знайдено</div>
              </TableCell>
            </TableRow>
          )}

          {currentTransactions?.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {transaction.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.sender?.name}</TableCell>
              <TableCell>{transaction.reciever?.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions:</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        deleteTransactionMutation.mutate({
                          id: transaction.id,
                        });
                      }}
                    >
                      {deleteTransactionMutation.isPending ? (
                        <Loader2 className="mx-auto h-3 w-3 animate-spin text-[#b5b5b5]" />
                      ) : (
                        <p className="text-red-500">Видалити</p>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
