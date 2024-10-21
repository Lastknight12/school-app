"use client";

import { type MusicOrder, type MusicOrderStatus } from "@prisma/client";
import { motion } from "framer-motion";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";

const statusColors = new Map<MusicOrderStatus, string>([
  ["DELIVERED", "text-yellow-500"],
  ["ACCEPTED", "text-green-500"],
  ["CANCELLED", "text-red-500"],
]);

interface Props {
  order: Pick<
    MusicOrder,
    "id" | "musicUrl" | "status" | "musicImage" | "musicTitle"
  > & {
    buyer: {
      name: string;
    };
  };
  index: number;
  type?: "radioCenter" | "student";
}

export default function MusicOrderCard({
  order,
  index,
  type = "student",
}: Props) {
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
      void utils.radioCenter.getOrders.invalidate();
      toast.success("Замовлення успішно скасоване");
    },
    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  return (
    <motion.a
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      href={order.musicUrl}
      key={order.id}
      className="flex bg-[#121212] border border-[#414040] rounded-lg p-4 max-sm:flex-col-reverse max-sm:items-end max-sm:gap-3 justify-between"
    >
      <div className="flex max-sm:flex-col gap-3 max-sm:w-full">
        <Image
          src={order.musicImage}
          width={120}
          height={100}
          alt="music image"
          className="rounded-lg max-sm:w-full"
        />

        <div className="flex text-sm flex-col justify-between py-1 max-sm:gap-3">
          <p className="max-w-[485px]">{order.musicTitle}</p>
          <p>
            Замовник:{" "}
            <span className="text-emerald-300 mt-2">{order.buyer.name}</span>
          </p>
          <p>
            Статус:{" "}
            <span className={statusColors.get(order.status)}>
              {order.status}
            </span>
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
    </motion.a>
  );
}
