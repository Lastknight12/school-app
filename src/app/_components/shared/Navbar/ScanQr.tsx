"use client";

import { useState } from "react";
import { LuScanLine } from "react-icons/lu";
import { toast } from "sonner";
import { env } from "~/env";

import { api } from "~/trpc/react";

import QrReader from "../QrReader";

export default function ScanQr() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const payment = api.transfers.pay.useMutation({
    onSuccess: () => {
      void utils.transfers.getTransfers.invalidate();
      toast.success("Успішно оплачено");
      setIsOpen(false);
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
      setIsOpen(false);
    },
  });

  function handleDataScanned(data: string) {
    // format url for regExp
    const formatedUrl = env.NEXT_PUBLIC_BUY_URL.replace(/[/.?]/g, (match) => {
      if (match === "/") return "\\/";
      if (match === ".") return "\\.";
      return match;
    });
    // regExp match only urls that includes token query and url from .env
    const urlRegExp = new RegExp(`${formatedUrl}\\?token=[a-zA-Z0-9]*`);

    if (!urlRegExp.test(data)) {
      toast.error("Невірний QR-код");
      setIsOpen(false);
      return;
    }

    const tokenFromUrl = data.split("?token=")[1]!;

    payment.mutate({ token: tokenFromUrl });
  }

  return (
    <QrReader
      isOpen={isOpen}
      onDataScanned={handleDataScanned}
      onOpenChange={setIsOpen}
      onCloseButtonClick={() => setIsOpen(false)}
    >
      <LuScanLine className="cursor-pointer text-2xl" />
    </QrReader>
  );
}
