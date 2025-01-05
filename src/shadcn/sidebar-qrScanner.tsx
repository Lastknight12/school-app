"use client";

import { ScanQrCode } from "lucide-react";
import { toast } from "sonner";

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

  function handleDataScanned(url: string) {
    payment.mutate({ url });
  }

  return (
    <QrReader onDataScanned={handleDataScanned}>
      <ScanQrCode />
    </QrReader>
  );
}
