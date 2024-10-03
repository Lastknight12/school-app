/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import TableContent from "./TableContent";
import { Loader2 } from "lucide-react";

export default function TeacherHomePage() {
  const klass = api.klass.getKlass.useQuery();

  return (
    <main className="mx-5">
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
              <TableCell colSpan={3}>
                <div className="text-center">Жодних учнів не знайдено</div>
              </TableCell>
            )}

            {klass.data?.students?.map((student) => (
              <TableContent
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
