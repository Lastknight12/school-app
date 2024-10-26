"use client";

import { type MusicOrder } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type Channel } from "pusher-js";
import { useEffect, useState } from "react";
import useSound from "use-sound";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";

import MusicOrderCard from "~/app/_components/shared/MusicOrderCard";

interface Order
  extends Pick<
    MusicOrder,
    "id" | "musicUrl" | "status" | "musicImage" | "musicTitle"
  > {
  buyer: {
    name: string;
  };
}

export default function Page() {
  const getOrders = api.radioCenter.getOrders.useQuery();

  const [orders, setOrders] = useState<Order[]>([]);
  const [play] = useSound("sounds/new-notification-7-210334.mp3", {
    volume: 1,
  });
  const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (getOrders.data) {
      setOrders(getOrders.data);
    }
  }, [getOrders.data]);

  useEffect(() => {
    const channel = pusherClient.subscribe("radioCenter");
    setPusherChannel(channel);
  }, []);

  useEffect(() => {
    if (pusherChannel) {
      pusherChannel.bind("order-created", (data: Order) => {
        play();
        setOrders((prev) => [data, ...prev]);
      });

      return () => {
        pusherChannel.unbind("order-created");
      };
    }
  }, [pusherChannel, play]);

  return (
    <div className="px-6">
      <div className="flex flex-col gap-3">
        {getOrders.isFetching && (
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-[#b5b5b5]" />
        )}

        {orders.length === 0 && <h1>Немає поточних замовлень</h1>}

        {orders.map((order) => (
          <MusicOrderCard key={order.id} order={order} type="radioCenter" />
        ))}
      </div>
    </div>
  );
}
