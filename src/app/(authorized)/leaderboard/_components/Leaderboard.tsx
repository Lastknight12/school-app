"use client";

import { motion, useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import getLeaderboard from "~/server/callers/user/getLeaderboard/post";

import { cn } from "~/lib/utils";

interface Props {
  session: Session;
}

export default function Leaderboard({ session }: Props) {
  const limit = 10;

  const leaderboard = getLeaderboard(
    {
      limit,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  if (leaderboard.isError) {
    toast.error("Виникла помилка під час завантаження даних");
  }

  const fetchTriger = useRef(null);

  const isScrolledToTrigger = useInView(fetchTriger);

  useEffect(() => {
    if (
      isScrolledToTrigger &&
      leaderboard.hasNextPage &&
      !leaderboard.isFetching
    ) {
      void leaderboard.fetchNextPage();
    }
  }, [leaderboard, isScrolledToTrigger]);

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        leaderboard.isFetching && "h-[calc(100vh-72px)]",
      )}
    >
      {/* Top 3 users and their balances */}
      <div className="mb-4 mt-20 grid grid-cols-3 items-end gap-3 px-3">
        {leaderboard.data?.pages[0]!.users.slice(0, 3).map((user, i) => (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: i * 0.2,
            }}
            key={user.id}
            className={cn(
              "relative row-start-1 flex flex-col items-center justify-start gap-2 rounded-xl bg-card px-5 py-4",
              i === 0 && "col-start-2 h-[calc(100%+60px)]",
              i === 1 && "col-start-1 h-[calc(100%+30px)]",
              i == 2 && "col-start-3",
            )}
          >
            <p className="absolute -top-9 left-1/2 -translate-x-1/2 text-2xl">
              {i + 1}
            </p>

            <Image
              src={user.image}
              alt={user.id}
              width={65}
              height={65}
              className="rounded-full h-[65px]"
            />

            <p className="break-all text-center">
              {user.name.length > 15
                ? user.name.slice(0, 15) + "..."
                : user.name}
            </p>

            <p className="text-center text-lg max-sm:text-sm">
              {user.balance} $
            </p>
          </motion.div>
        ))}
      </div>

      {/* Users list */}
      <div
        className={cn(
          // 72 px - navbar
          "flex w-full  grow flex-col items-center gap-3 rounded-tl-xl rounded-tr-xl bg-card px-3 pt-6",
        )}
      >
        {leaderboard.isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        )}

        {leaderboard.data?.pages?.map((page, pageIndex) =>
          page.users.map((user, userIndexInPage) => (
            <div
              key={user.id}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2",
                session.user.id === user.id
                  ? "bg-accent sticky bottom-4"
                  : "bg-accent/50",
              )}
            >
              <div className="flex items-center gap-4">
                {/* User place number */}
                <p>{pageIndex * limit + userIndexInPage + 1}</p>

                {user.image ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={user.image}
                      alt={user.id}
                      fill
                      className="object-cover"
                      sizes="40"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300" />
                )}

                <div>{user.name}</div>
              </div>

              <div className="text-right max-sm:text-sm">{user.balance} $</div>
            </div>
          )),
        )}

        {/* loading when fetching next page */}
        {leaderboard.isFetchingNextPage && (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#b5b5b5]" />
        )}

        {/* fetch trigger */}
        <div ref={fetchTriger} />
      </div>
    </div>
  );
}
