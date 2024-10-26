"use client";

import { type MusicOrder } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

import { api } from "~/trpc/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";

interface Props {
  order: Pick<
    MusicOrder,
    "id" | "musicUrl" | "status" | "musicImage" | "musicTitle"
  > & {
    buyer: {
      name: string;
    };
  };
  type?: "radioCenter" | "student";
}

export default function MusicOrderCard({ order, type = "student" }: Props) {
  const utils = api.useUtils();
  const acceptOrderMutation = api.radioCenter.acceptOrder.useMutation({
    onSuccess: () => {
      void utils.radioCenter.getOrders.invalidate();
      toast.success("Замовлення успішно прийняте");
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  const cancelOrderMutation = api.radioCenter.cancelOrder.useMutation({
    onSuccess: () => {
      void utils.radioCenter.getCurrentTrackAndQueue.invalidate();
      toast.success("Замовлення успішно скасоване");
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  return (
    <Link
      href={order.musicUrl}
      className="flex bg-[#121212] border border-[#414040] rounded-lg p-4 justify-between"
    >
      <div className="flex gap-3">
        <Image
          src={order.musicImage}
          width={90}
          height={70}
          alt="music image"
          className="rounded-lg max-w-[90px]"
        />

        <div className="flex text-sm flex-col py-1 gap-2">
          <p className="max-w-[485px]">{order.musicTitle}</p>
          <p>
            Замовник:{" "}
            <span className="text-emerald-300 mt-2">{order.buyer.name}</span>
          </p>
        </div>
      </div>

      {type === "radioCenter" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <EllipsisVertical size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => acceptOrderMutation.mutate({ id: order.id })}
              >
                <span className="text-green-500">Прийняти</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => cancelOrderMutation.mutate({ id: order.id })}
              >
                <span className="text-red-500">Відмінити</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Link>
  );
}
