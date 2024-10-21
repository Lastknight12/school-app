"use client";

import { type MusicOrderStatus } from "@prisma/client";
import { useEffect } from "react";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";

import CreateOrderModal from "~/app/_components/(radioCenter)/music/CreateOrderModal";
import MusicOrderCard from "~/app/_components/shared/MusicOrderCard";

export const statusColors = new Map<MusicOrderStatus, string>([
  ["DELIVERED", "text-yellow-500"],
  ["ACCEPTED", "text-green-500"],
  ["CANCELLED", "text-red-500"],
]);

export default function Page() {
  const utils = api.useUtils();

  const getOrders = api.radioCenter.getOrders.useQuery({
    filter: null,
  });

  useEffect(() => {
    const channel = pusherClient.subscribe("radioCenter");

    channel.bind("refresh", () => {
      void utils.radioCenter.getOrders.invalidate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-6 pb-2">
      <div className="flex gap-2">
        <CreateOrderModal />
      </div>

      <div className="flex flex-col mt-4 gap-6">
        {getOrders.data?.map((order, index) => {
          return <MusicOrderCard key={order.id} order={order} index={index} />;
        })}
      </div>
    </div>
  );
}
