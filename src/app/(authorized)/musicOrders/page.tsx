"use client";

import { type MusicOrder } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import useSound from "use-sound";

import getMusicOrders from "~/server/callers/radioCenter/orders/get";

import { socket } from "~/lib/socket";
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
  const getOrders = getMusicOrders();

  const [userInteraction, setUserInteracted] = useState(false);

  const [play] = useSound("sounds/new-notification-7-210334.mp3", {
    volume: 1,
  });

  useEffect(() => {
    socket.emit("joinRoom", { roomId: "radioCenter" });

    socket.on("order-created", (data: Order) => {
      console.log(data);
      play();
      setOrders((prev) => [data, ...prev]);
    });

    return () => {
      socket.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  useEffect(() => {
    if (getOrders.data && getOrders.data.length > 0) {
      setOrders(getOrders.data);
    }
  }, [getOrders.data]);

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
