"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { Input } from "~/shadcn/ui/input";

export default function ReplenishDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");

  const utils = api.useUtils();

  const isAmountPositive = amount > 0;

  const replenishKaznaMutation = api.kazna.replenishKazna.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success("Казна поповнена");
      void utils.kazna.getReplenishHistory.invalidate();
    },

    onError: () => {
      toast.error("Помилка поповнення");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="cursor-pointer">
        <Button variant="secondary">Поповнити казну</Button>
      </DialogTrigger>
      <DialogContent className="max-md:max-w-full">
        <DialogHeader>
          <DialogTitle>Поповнення казни</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            variant="accent"
            value={amount}
            className="w-min"
            defaultValue={0}
            placeholder="Сумма"
            onChange={({ target: { value } }) =>
              setAmount(value ? parseInt(value) : 0)
            }
          />

          <Input
            variant="accent"
            value={message}
            placeholder="Повідомлення"
            onChange={(e) => setMessage(e.target.value)}
          />

          <Button
            disabled={!isAmountPositive || replenishKaznaMutation.isPending}
            onClick={() => replenishKaznaMutation.mutate({ amount, message })}
            variant="secondary"
          >
            Поповнити{" "}
            {replenishKaznaMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-[#b5b5b5]" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
