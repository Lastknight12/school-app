"use client";

import { LuScanLine } from "react-icons/lu";
import { useState } from "react";
import QrReader from "../QrReader";
import { toast } from "sonner";
import { env } from "~/env";
import { api } from "~/trpc/react";

export default function ScanQr() {
  const [isOpen, setIsOpen] = useState(false);
  const payment = api.transfers.pay.useMutation({
    onSuccess: () => {
      toast.success("Платіж успішно відправлений");
    },
    onError: (error) => {
      toast.error(error.message);
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
    <div className="flex items-center gap-2">
      <QrReader isOpen={isOpen} onDataScanned={handleDataScanned} onOpenChange={setIsOpen}>
        <LuScanLine className="cursor-pointer text-2xl" />
      </QrReader>
    </div>
  );
}
