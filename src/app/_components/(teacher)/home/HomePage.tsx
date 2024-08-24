/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import TableContent from "./TableContent";

export default function TeacherHomePage() {
  const klass = api.klass.getKlass.useQuery();

  return (
    <main className="mx-5">
      <div>
        <Table>
          <TableCaption>Список учнів</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {klass.data?.students.map((student) => (
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
