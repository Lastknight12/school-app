"use client";

import { Loader2 } from "lucide-react";

import { api } from "~/trpc/react";

import KlassTableContent from "./KlassTableContent";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/ui/table";

interface Props {
  id: string;
}

export default function KlassTable({ id }: Props) {
  const klass = api.klass.getTeacherKlassData.useQuery({ id });

  return (
    <main className="mx-5 px-6">
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {klass.isFetching && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#b5b5b5]" />
                </TableCell>
              </TableRow>
            )}

            {klass.data?.students.length === 0 && !klass.isFetching && (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="text-center">Жодних учнів не знайдено</div>
                </TableCell>
              </TableRow>
            )}

            {klass.data?.students?.map((student) => (
              <KlassTableContent
                key={student.id}
                student={student}
                onSuccess={() => klass.refetch()}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
