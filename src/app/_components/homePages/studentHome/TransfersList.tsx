"use client";

import { useInView } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";

import { type formatedTransfer } from "~/server/api/routers/transfers";
import { type getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/react";

interface Props {
  session: Awaited<ReturnType<typeof getServerAuthSession>>;
}

export default function TransfersList({ session }: Props) {
  const { data: transfers, ...getTransfers } =
    api.transfers.getTransfers.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const fetchTrigger = useRef(null);

  const isScrolledToTrigger = useInView(fetchTrigger);

  useEffect(() => {
    if (
      isScrolledToTrigger &&
      getTransfers.hasNextPage &&
      !getTransfers.isFetching
    ) {
      void getTransfers.fetchNextPage();
    }
  }, [getTransfers, isScrolledToTrigger]);

  return (
    <div className="mt-12 min-h-[calc(100vh-64px-200px)] overflow-hidden rounded-tl-[30px] rounded-tr-[30px] border-t border-border bg-accent pb-4">
      {/* Top line */}
      <div className="flex items-center justify-center py-5">
        <div className="h-1 w-9 rounded bg-[#ffffff1a]" />
      </div>
      {!getTransfers.isLoading &&
        transfers?.pages[0]?.transfers.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            Немає транзакцій
          </div>
        )}

      {getTransfers.isLoading && (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        </div>
      )}

      {/* List */}
      <div className="h-[calc(100%-60px)] overflow-y-scroll px-5">
        <div className="flex flex-col gap-5">
          {!getTransfers.isLoading &&
            transfers?.pages.map((page) => {
              return page.transfers.map((transfer) => {
                const formatedGradient =
                  transfer.randomGradient as formatedTransfer["randomGradient"];

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const isUserSender = transfer.sender?.id === session?.user.id;
                return (
                  <div
                    className="flex items-center justify-between gap-5"
                    key={transfer.id}
                  >
                    <div className="flex items-center gap-4">
                      {transfer.type === "BUY" ? (
                        <div
                          className={`flex items-center justify-center rounded-full bg-gradient-to-tr p-3`}
                          style={
                            {
                              "--tw-gradient-stops": `${formatedGradient.from}, ${formatedGradient.to}`,
                            } as CSSProperties
                          }
                        >
                          <ShoppingCart color="#232323a1" size={20} />
                        </div>
                      ) : isUserSender ? (
                        <Image
                          src={transfer.reciever!.image}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-full h-10"
                        />
                      ) : (
                        <Image
                          src={transfer.sender!.image}
                          alt="avatar"
                          width={40}
                          height={40}
                          className="rounded-full h-10"
                        />
                      )}

                      <div>
                        <h1 className="font-bold tracking-wide text-[#fafafa]">
                          {transfer.type === "BUY"
                            ? "Покупка товару"
                            : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                              isUserSender
                              ? transfer.reciever?.name
                              : transfer.sender?.name}
                        </h1>
                        <p className="text-sm font-semibold text-[#fafafa4d]">
                          {transfer.createdAt.toLocaleDateString("uk-UA", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`${isUserSender ? "text-[#FF5959]" : "text-[#53D496]"}`}
                    >
                      {isUserSender ? "-" : "+"} {transfer.amount + "$"}
                    </div>
                  </div>
                );
              });
            })}

          <div
            className="flex h-full w-full items-center justify-center"
            ref={fetchTrigger}
          >
            {getTransfers.hasNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
