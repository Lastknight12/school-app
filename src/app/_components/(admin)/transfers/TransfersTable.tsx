import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import Image from "next/image";

interface Props {
  from: Date;
  to: Date;
}

export function TransfersTable({ from, to }: Props) {
  const getTransfers = api.transfers.getTransfersByPeriod.useQuery({
    from,
    to,
  });

  return (
    <Table>
      <TableCaption>Список транзакцій покупок</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Products bought</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {getTransfers.data?.productsWithBalance.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">
              {transfer.sender?.name}
            </TableCell>
            <TableCell>{transfer.sender?.email}</TableCell>
            <TableCell>{transfer.amount}</TableCell>
            <TableCell className="text-right">
              <div className="flex">
                <div></div>
                <div className="-margin-2 w-[30px] h-[30px] bg-white rounded-full"></div>
                <div className="-margin-2 w-[30px] h-[30px] bg-white rounded-full"></div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            ${getTransfers.data?.totalAmount}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
