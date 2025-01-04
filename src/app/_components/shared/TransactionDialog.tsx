"use client";

import type { User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { sendAmountSchema } from "~/schemas/zod";

import { api } from "~/trpc/react";

import { Button } from "~/shadcn/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/shadcn/ui/dialog";

interface Props {
  user: User;
  children?: React.ReactNode;
  isOpen?: boolean;
  session: Session;
  onMutationSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export default function TransactionDialog({
  user,
  children,
  session,
  isOpen: customIsOpen,
  onOpenChange,
  onMutationSuccess,
}: Props) {
  console.log(session.user);
  const [amount, setAmount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const isAmountPositive = amount > 0;
  const maxValue = 99999999; // 99 999 999

  const sendMoneyMutation = api.transfers.sendMoney.useMutation({
    onSuccess: () => {
      toast.success("Кошти були надіслані");
      onMutationSuccess?.();
      setIsOpen(false);
    },
    onError: (error) => {
      error.data?.zodError && error.data?.zodError.length > 0
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  function handleOpenChange(open: boolean) {
    onOpenChange?.(open);
    setIsOpen(open);
  }

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const onlyNumbers = e.target.value
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1");

    if (+onlyNumbers > maxValue) return;

    setAmount(+onlyNumbers);
  }

  function handleSubmit() {
    if (session.user.role === "STUDENT" || session.user.role === "TEACHER") {
      try {
        sendAmountSchema.parse({ amount });

        if (amount > session.user.balance) {
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
    }

    sendMoneyMutation.mutate({ receiverId: user.id, amount });
  }

  return (
    <Dialog open={customIsOpen ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent
        className="max-md:max-w-full h-full !rounded-none backdrop-blur-md"
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={user.image}
              alt="avatar"
              className="rounded-full h-[35px]"
              width={35}
              height={35}
            />

            <h1>{user.name}</h1>
          </div>

          <div className="flex w-full flex-col items-center">
            <p className="text-[#6f6f6f]">Бланс: {session.user.balance}</p>
            <input
              className="w-[inherit] bg-transparent text-center text-4xl outline-none"
              value={amount}
              maxLength={10}
              onChange={handleAmountChange}
            />
          </div>

          <Button
            disabled={!isAmountPositive || sendMoneyMutation.isPending}
            onClick={handleSubmit}
            variant="secondary"
          >
            Відправити{" "}
            {sendMoneyMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
