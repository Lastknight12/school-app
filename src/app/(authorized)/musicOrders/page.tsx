"use client";

import { type MusicOrder } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type Channel } from "pusher-js";
import { useEffect, useState } from "react";
import useSound from "use-sound";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";
import { cn } from "~/lib/utils";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const getOrders = api.radioCenter.getOrders.useQuery(void 0, {
    refetchOnWindowFocus: false,
  });

  const [userInteraction, setUserInteracted] = useState(false);

  const [play] = useSound("sounds/new-notification-7-210334.mp3", {
    volume: 1,
  });
  const [pusherChannel, setPusherChannel] = useState<Channel | undefined>(
    undefined,
  );

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

  async function refresh(id: string) {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }

  if (!userInteraction) {
    return (
      <button
        className="w-screen h-full_page flex items-center justify-center"
        onClick={() => setUserInteracted(true)}
      >
        <p>
          Клацніть щоб продовжити. Це необхідно для відтворення звуку при
          надходженні нових замовлень
        </p>
      </button>
    );
  }

  return (
    <div className={cn("px-6", getOrders.isPending && "h-full_page")}>
      {getOrders.isFetching && (
        <div className="h-full flex items-center justify-center mb-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!getOrders.isFetching && orders.length === 0 && (
          <h1>Немає нових замовлень</h1>
        )}

        {orders.map((order) => (
          <MusicOrderCard
            key={order.id}
            order={order}
            type="radioCenter"
            refresh={() => refresh(order.id)}
          />
        ))}
      </div>
    </div>
  );
}
