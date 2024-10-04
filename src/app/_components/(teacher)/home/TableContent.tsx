import type { User } from "@prisma/client";
import { useState } from "react";
import { TableCell, TableRow } from "~/components/ui/table";
import TransactionDialog from "../../shared/TransactionDialog";

interface Props {
  student: User;
  onSuccess: () => void;
}

export default function TableContent({ student, onSuccess }: Props) {
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
        isTeacher={true}
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
