"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ScanQrCode } from "lucide-react";
import { toast } from "sonner";

import pay from "~/server/callers/transfers/pay/post";

import QrReader from "~/app/_components/shared/QrReader";

export default function SidebarQrScanner() {
  const utils = useQueryClient();

  const payment = pay({
    onSuccess: () => {
      void utils.invalidateQueries({ queryKey: ["getTransfers"] });
      toast.success("Успішно оплачено");
    },
    onError: (error) => {
      typeof error.message === "string" &&
        toast.error(
          error.message === "Невірний URL" ? "Невірний QR-код" : error.message,
        );
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
