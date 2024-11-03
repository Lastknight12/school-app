"use client";

import { type MusicOrder } from "@prisma/client";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

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
  className?: string;
}

export default function MusicOrderCard({
  order,
  type = "student",
  className,
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
    <div
      className={
        "flex bg-card border items-start border-border rounded-lg"
      }
    >
      <Link
        href={order.musicUrl}
        className={cn(
          "flex gap-5 w-full",
          className,
          type === "radioCenter" ? "pl-6 py-4" : "py-4 px-6",
        )}
      >
        <Image
          src={order.musicImage}
          width={90}
          height={70}
          alt="music image"
          className="rounded-lg"
        />

        <div className="flex text-sm flex-col gap-2">
          <p className="max-w-[285px] text-base font-bold max-sm:text-base">
            {order.musicTitle.length > 47
              ? order.musicTitle.slice(0, 44) + "..."
              : order.musicTitle}
          </p>
          <p className="max-sm:text-sm">
            Замовник:{" "}
            <span className="text-emerald-300 mt-2">
              {order.buyer.name.length > 25
                ? order.buyer.name.slice(0, 22) + "..."
                : order.buyer.name}
            </span>
          </p>
        </div>
      </Link>

      {type === "radioCenter" && (
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none pt-4 pr-6">
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
    </div>
  );
}
