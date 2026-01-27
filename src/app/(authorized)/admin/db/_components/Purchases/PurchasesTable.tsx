"use client";

import { type PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

import ProductsModal from "./ProductsModal";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/ui/table";

interface Data {
  status: PurchaseStatus;
  id: string;
  amount: number;
  createdAt: Date;
  productsBought: {
    id: string;
    title: string;
    image: string;
    count: number;
    Category: {
      name: string;
    };
    pricePerOne: number;
  }[];
  buyer: {
    name: string;
    email: string;
  } | null;
}

interface Props {
  range: { from: string; to?: string };
  data?: Data[];
  totalAmount?: number;
  isFetching: boolean;
}

export function TransfersTable({
  data,
  range,
  isFetching,
  totalAmount,
}: Props) {
  return (
    <Table>
      <TableCaption>
        Список транзакцій з <span>{range.from}</span>{" "}
        {/* 
          show only if user provide range.to that dont match range.from. 
          For example from 2024-11-10 to 2024-11-10 will not show.
        */}
        {range.to && range.to !== range.from && (
          <span>по {format(range.to, "yyyy-MM-dd")}</span>
        )}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Date</TableHead>
          <TableHead className="w-[200px]">User Name</TableHead>
          <TableHead className="w-[150px]">Status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Products bought</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!isFetching && data?.length === 0 && (
          <TableRow>
            <TableCell colSpan={6}>
              <div className="text-center">Транзакцій не знайдено</div>
            </TableCell>
          </TableRow>
        )}

        {data?.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">
              {transfer.createdAt.toLocaleDateString()}
            </TableCell>
            <TableCell className="font-medium">
              {transfer.buyer?.name ?? "Відсутні дані"}
            </TableCell>
            <TableCell>{transfer.status}</TableCell>
            <TableCell>{transfer.buyer?.email}</TableCell>
            <TableCell>
              <ProductsModal products={transfer.productsBought} />
            </TableCell>
            <TableCell
              className={cn(
                "text-right",
                transfer.status === "PENDING" && "text-red-600",
              )}
            >
              {transfer.amount} $
            </TableCell>
          </TableRow>
        ))}

        {isFetching && (
          <TableRow>
            <TableCell colSpan={6}>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#b5b5b5]" />
            </TableCell>
          </TableRow>
        )}
      </TableBody>

      <TableFooter>
        {!isFetching && data && data.length > 0 && (
          <TableRow>
            <TableCell colSpan={5}>Усього</TableCell>
            <TableCell className="text-right">{totalAmount} $</TableCell>
          </TableRow>
        )}
      </TableFooter>
    </Table>
  );
}
