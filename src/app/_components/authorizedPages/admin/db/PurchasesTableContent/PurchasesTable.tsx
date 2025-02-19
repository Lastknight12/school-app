import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

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

interface Props {
  range: { from: string; to?: string };
}

export function TransfersTable({ range }: Props) {
  const getTransfers = api.transfers.getTransfersByPeriod.useQuery(
    {
      range,
    },
    {
      gcTime: 0,
    },
  );

  const hasData = getTransfers.data && getTransfers.data.transfers.length > 0;

  useEffect(() => {
    if (getTransfers.error) {
      toast.error(getTransfers.error.message);
    }
  }, [getTransfers.error]);

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
        {!getTransfers.isFetching && !hasData && (
          <TableRow>
            <TableCell colSpan={6}>
              <div className="text-center">Транзакцій не знайдено</div>
            </TableCell>
          </TableRow>
        )}

        {hasData &&
          getTransfers.data.transfers.map((transfer) => (
            <TableRow key={transfer.id}>
              <TableCell className="font-medium">
                {transfer.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className="font-medium">
                {transfer.sender?.name ?? "Відсутні дані"}
              </TableCell>
              <TableCell>{transfer.status}</TableCell>
              <TableCell>{transfer.sender?.email}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {transfer.productsBought.slice(0, 4).map((product, i) => (
                    <div
                      key={product.id}
                      className={cn(
                        "relative z-10 h-10 w-10 overflow-hidden rounded-full",
                        i > 0 ? `-ml-5` : "ml-0",
                      )}
                    >
                      <Image
                        src={product.image}
                        alt={product.id}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {transfer.productsBought.length > 4 && (
                    <div className="ml-2">
                      +{transfer.productsBought.length - 4}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{transfer.amount} $</TableCell>
            </TableRow>
          ))}
      </TableBody>
      {getTransfers.isFetching && (
        <TableRow>
          <TableCell colSpan={6}>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#b5b5b5]" />
          </TableCell>
        </TableRow>
      )}

      <TableFooter>
        {!getTransfers.isFetching && hasData && (
          <TableRow>
            <TableCell colSpan={5}>Усього</TableCell>
            <TableCell className="text-right">
              {getTransfers.data?.totalAmount} $
            </TableCell>
          </TableRow>
        )}
      </TableFooter>
    </Table>
  );
}
