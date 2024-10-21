import type { User } from "@prisma/client";
import { type Session } from "next-auth";
import { useState } from "react";

import TransactionDialog from "~/app/_components/shared/TransactionDialog";

import { TableCell, TableRow } from "~/shadcn/ui/table";

interface Props {
  student: User;
  session: Session;
  onSuccess: () => void;
}

export default function KlassTableContent({
  student,
  onSuccess,
  session,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  function onMutationSuccess() {
    setIsOpen(false);
    onSuccess();
  }

  return (
    <>
      <TransactionDialog
        user={student}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        session={session}
        onMutationSuccess={onMutationSuccess}
      >
        <TableRow key={student.id}>
          <TableCell className="font-medium">{student.name}</TableCell>
          <TableCell>{student.email}</TableCell>
          <TableCell>${student.balance}</TableCell>
        </TableRow>
      </TransactionDialog>
    </>
  );
}
