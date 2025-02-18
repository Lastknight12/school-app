"use client";

import { Loader2 } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { type Session } from "next-auth";
import Image from "next/image";
import { type CSSProperties } from "react";

import { type formatedTransfer } from "~/server/api/routers/transfers";
import { api } from "~/trpc/react";

interface Props {
  session: Session | null;
}

export default function TransfersList({ session }: Props) {
  const { data: transfers, isFetching } = api.transfers.getTransfers.useQuery(
    void 0,
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="mt-12 min-h-[calc(100vh-64px-200px)] overflow-hidden rounded-tl-[30px] rounded-tr-[30px] border-t border-border bg-accent pb-4">
      {/* Top line */}
      <div className="flex items-center justify-center py-5">
        <div className="h-1 w-9 rounded bg-[#ffffff1a]" />
      </div>
      {!isFetching && transfers?.length === 0 && (
        <div className="flex h-full w-full items-center justify-center text-2xl">
          Немає транзакцій
        </div>
      )}

      {isFetching && (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        </div>
      )}

      {/* List */}
      <div className="h-[calc(100%-60px)] overflow-y-scroll px-5">
        <div className="flex flex-col gap-5">
          {!isFetching &&
            transfers?.map((transfer) => {
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
                        <ShoppingCart fill="#232323a1" size={20} />
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
            })}
        </div>
      </div>
    </div>
  );
}
