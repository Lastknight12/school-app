"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import { api } from "~/trpc/react";

import { pusherClient } from "~/lib/pusher-client";

import CreateOrderModal from "~/app/_components/(radioCenter)/music/CreateOrderModal";
import MusicOrderCard from "~/app/_components/shared/MusicOrderCard";

import { Skeleton } from "~/shadcn/ui/skeleton";

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
      <div className="flex gap-2 mb-3">
        <CreateOrderModal />
      </div>

      <div className=" mb-8 max-w-max">
        <h1 className="text-xl mb-3">Поточний трек:</h1>

        {getOrders.isFetching ? (
          <div className="flex gap-5 px-5 py-4 bg-card border-border rounded-lg max-[380px]:flex-col">
            <Skeleton className="w-[100px] h-[70px]" />

            <div className="flex flex-col gap-2">
              <Skeleton className="w-[150px] h-[20px] rounded max-[380px]:w-[250px]" />
              <Skeleton className="w-[100px] h-[20px] rounded max-[380px]:w-[140px]" />
            </div>
          </div>
        ) : (
          getOrders.data?.currentTrack && (
            <MusicOrderCard
              order={getOrders.data?.currentTrack}
              className="max-[380px]:flex-col max-[380px]:justify-center"
            />
          )
        )}
      </div>

      <h1 className="text-xl mb-3">Наступні треки: </h1>
      <div className="flex flex-col gap-4">
        {getOrders.data?.playerQueue.length === 0 && !getOrders.isFetching && (
          <h1>Немає наступних треків</h1>
        )}

        {/* Loading state */}
        {getOrders.isFetching &&
          Array.from({ length: 3 }).map((_, index) => {
            return (
              <div key={index} className="flex gap-5 px-5 py-4 bg-card border-border rounded-lg max-[380px]:flex-col">
                <Skeleton className="w-[100px] h-[70px]" />

                <div className="flex flex-col gap-2">
                  <Skeleton className="w-[150px] h-[20px] rounded max-[380px]:w-[250px]" />
                  <Skeleton className="w-[100px] h-[20px] rounded max-[380px]:w-[140px]" />
                </div>
              </div>
            );
          })}

        {/* List of songs */}
        {!getOrders.isFetching &&
          getOrders.data?.playerQueue.map((order, index) => {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                key={index}
              >
                <MusicOrderCard
                  order={order}
                  className="max-[380px]:flex-col"
                />
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
