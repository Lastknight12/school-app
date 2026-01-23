import type { User } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

import TransactionDialog from "~/app/_components/shared/TransactionDialog";

import { TableCell, TableRow } from "~/shadcn/ui/table";

interface Props {
  student: User;
  onSuccess: () => void;
}

export default function KlassTableContent({ student, onSuccess }: Props) {
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
        onMutationSuccess={onMutationSuccess}
      >
        <TableRow key={student.id}>
          <TableCell>
            <Image
              src={student.image ?? ""}
              alt="image"
              width={40}
              height={40}
              className="rounded-full h-10"
            />
          </TableCell>
          <TableCell className="font-medium">{student.name}</TableCell>
          <TableCell>{student.email}</TableCell>
          <TableCell>${student.balance}</TableCell>
        </TableRow>
      </TransactionDialog>
    </>
  );
}
