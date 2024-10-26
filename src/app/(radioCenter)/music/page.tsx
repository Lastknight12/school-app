"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";

import CreateOrderModal from "~/app/_components/(radioCenter)/music/CreateOrderModal";
import MusicOrderCard from "~/app/_components/shared/MusicOrderCard";
import { Loader2 } from "lucide-react";

export default function Page() {
  const utils = api.useUtils();

  const getOrders = api.radioCenter.getCurrentTrackAndQueue.useQuery(void 0, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const channel = pusherClient.subscribe("radioCenter");

    channel.bind("refresh", () => {
      void utils.radioCenter.getCurrentTrackAndQueue.invalidate();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-6 pb-2">
      <div className="flex gap-2">
        <CreateOrderModal />
      </div>

      <div className="mt-2 mb-4">
        <h1 className="text-xl">Поточний трек:</h1>

        {getOrders.data?.currentTrack && (
          <MusicOrderCard order={getOrders.data?.currentTrack} />
        )}

        {getOrders.isFetching && (
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        )}
      </div>

      <div>
        <h1 className="mb-2 text-xl">Наступні треки: </h1>
        {getOrders.data?.playerQueue.length === 0 && !getOrders.isFetching && (
          <h1>Немає наступних треків</h1>
        )}

        {getOrders.data?.playerQueue.map((order, index) => {
          return (
            <div className="flex gap-4 items-center" key={order.id}>
              <p>{index + 1}</p>
              <motion.a
                href={order.musicUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MusicOrderCard order={order} />
              </motion.a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
