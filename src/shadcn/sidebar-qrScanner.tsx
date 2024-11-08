"use client";

import { ScanQrCode } from "lucide-react";
import { toast } from "sonner";
import { env } from "~/env";

import { api } from "~/trpc/react";

import QrReader from "~/app/_components/shared/QrReader";

export default function SidebarQrScanner() {
  const utils = api.useUtils();

  const payment = api.transfers.pay.useMutation({
    onSuccess: () => {
      void utils.transfers.getTransfers.invalidate();
      toast.success("Успішно оплачено");
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  function handleDataScanned(data: string) {
    console.log(data)
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
      return;
    }

    const tokenFromUrl = data.split("?token=")[1]!;

    payment.mutate({ token: tokenFromUrl });
  }

  return (
    <QrReader onDataScanned={handleDataScanned}>
      <ScanQrCode />
    </QrReader>
  );
}
