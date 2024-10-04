"use client";

import type { User } from "@prisma/client";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  useState,
  type ChangeEvent,
  useEffect,
} from "react";
import { z } from "zod";
import { sendAmountSchema } from "~/schemas/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";

interface Props {
  user: User;
  sessionBalance?: number;
  children?: React.ReactNode;
  isOpen?: boolean;
  isTeacher?: boolean;
  onMutationSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function TransactionDialog({
  user,
  children,
  sessionBalance,
  isTeacher,
  isOpen: customIsOpen,
  onOpenChange,
  onMutationSuccess,
}: Props) {
  const [amount, setAmount] = useState(0);
  const [isOpen, setIsOpen] = useState(customIsOpen ?? false);

  const isAmountValid = amount > 0;
  const maxValue = 99999999; // 99 999 999

  const sendMoneyMutation = api.transfers.sendMoney.useMutation({
    onSuccess: () => {
      toast.success("Платіж успішно відправлений");
      onMutationSuccess?.();
      setIsOpen(false);
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      error.data?.zodError
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  useEffect(() => {
    onOpenChange?.(isOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const onlyNumbers = e.target.value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");

    if (+onlyNumbers > maxValue) return;

    setAmount(+onlyNumbers);
  }

  function handleSubmit() {
    if (!isTeacher)
      try {
        sendAmountSchema.parse({ amount });

        if (amount > user.balance) {
          throw new z.ZodError([
            {
              code: "custom",
              message: "Недостатній баланс",
              path: ["amount"],
            },
          ]);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(error.issues[0]!.message);
          return;
        }
      }

    sendMoneyMutation.mutate({ receiverId: user.id, amount });
  }

  return (
    <Dialog open={customIsOpen ?? isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-md:max-w-full h-full !rounded-none backdrop-blur-md">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={user.image}
              alt="avatar"
              className="rounded-full"
              width={35}
              height={35}
            />

            <h1>{user.name}</h1>
          </div>

          <div className="flex w-full flex-col items-center">
            {!isTeacher ? (
              <p className="text-[#6f6f6f]">Бланс: {sessionBalance ?? 0}</p>
            ) : (
              <p className="mb-1">Кількість баллів:</p>
            )}
            <input
              className="w-[inherit] bg-transparent text-center text-4xl outline-none"
              value={amount}
              maxLength={10}
              onChange={handleAmountChange}
            />
          </div>

          <button
            disabled={!isAmountValid}
            onClick={handleSubmit}
            className={`flex items-center justify-center gap-3 rounded-lg bg-card px-4 py-2 transition-opacity ${(!isAmountValid || sendMoneyMutation.isPending) && "cursor-not-allowed opacity-40"}`}
          >
            Відправити{" "}
            {sendMoneyMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
