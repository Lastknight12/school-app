"use client";

import { format } from "date-fns";
import { ArrowRightFromLine, Loader2 } from "lucide-react";
import Image from "next/image";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { TruncatedText } from "~/app/_components/shared/TruncatedText";

export default function ReplenishHistory() {
  const replenishHistory = api.kazna.getReplenishHistory.useQuery();

  return (
    <div className="w-full">
      {replenishHistory.isFetching && (
        <Loader2 className="h-6 w-6 mx-auto animate-spin text-[#b5b5b5]" />
      )}

      {!replenishHistory.isFetching &&
        replenishHistory.data?.map((replenish, i) => {
          return (
            <div
              className={cn(
                "flex justify-between items-center bg-accent py-3 px-4 rounded-md mx-auto max-w-[500px]",
                i !== 0 && "mt-6",
              )}
              key={replenish.id}
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <div className="flex gap-2 items-center">
                    <Image
                      src={replenish.sender.image ?? ""}
                      width={20}
                      height={20}
                      alt="avatar"
                      className="rounded-full w-8 h-8"
                    />

                    <TruncatedText
                      text={replenish.sender.name}
                      maxLength={10}
                    />
                  </div>

                  {replenish.type === "TRANSFER" && replenish.reciever && (
                    <>
                      <ArrowRightFromLine color="#959595" />

                      <div className="flex gap-2 items-center">
                        <Image
                          src={replenish.reciever.image ?? ""}
                          width={20}
                          height={20}
                          alt="avatar"
                          className="rounded-full w-8 h-8"
                        />

                        <TruncatedText
                          text={replenish.reciever.name}
                          maxLength={10}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="w-max max-w-[240px] text-wrap font-e_ukraine font-extralight">
                  <TruncatedText text={replenish.comment} maxLength={50} />
                </div>

                <p className="text-[#fafafa4d]">
                  {format(replenish.createdAt, "dd.MM.yyyy")}
                </p>
              </div>

              <h1
                className={cn(
                  "text-xl",
                  replenish.amount > 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {replenish.amount}
              </h1>
            </div>
          );
        })}
    </div>
  );
}
