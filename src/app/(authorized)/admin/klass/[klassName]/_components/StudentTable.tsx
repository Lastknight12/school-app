"use client";

import {
  type ColumnDef,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownNarrowWide,
  ArrowUpDown,
  ArrowUpNarrowWide,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { createContext, useContext } from "react";

import { api } from "~/trpc/react";

import { Button } from "~/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/ui/table";

interface Student {
  name: string;
  email: string;
  image?: string | null;
}
interface Props {
  klassId: string;
  children?: React.ReactNode;
}

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <Image
        src={row.getValue("image")}
        alt="image"
        width={40}
        height={40}
        className="rounded-full h-10"
      />
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="w-[200px]">Name</div>,
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "balance",
    enableSorting: true,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting()}
        className="flex items-center"
      >
        Balance
        {column.getIsSorted() === "desc" && (
          <ArrowDownNarrowWide className=" w-4 h-4" />
        )}
        {column.getIsSorted() === "asc" && (
          <ArrowUpNarrowWide className=" w-4 h-4" />
        )}
        {column.getIsSorted() === false && <ArrowUpDown className="w-4 h-4" />}
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("balance")}$</div>,
  },
];

const StudentTableContext = createContext<TanstackTable<Student> | null>(null);

export default function StudentsTable({ klassId, children }: Props) {
  const getStudents = api.klass.getKlassStudents.useQuery({ id: klassId });
  const table = useReactTable<Student>({
    data: getStudents.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    rowCount: 10,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!table) {
    return (
      <StudentTableContext.Provider value={table}>
        <div className="flex justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </StudentTableContext.Provider>
    );
  }

  return (
    <>
      <StudentTableContext.Provider value={table}>
        <div>{children}</div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 &&
              !getStudents.isFetching && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Жодних учнів не знайдено
                  </TableCell>
                </TableRow>
              )}

            {getStudents.data && !getStudents.isFetching ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#b5b5b5]" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StudentTableContext.Provider>
    </>
  );
}

export const useStudentTable = () => useContext(StudentTableContext);
