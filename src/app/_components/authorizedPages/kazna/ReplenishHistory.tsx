"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import {cn} from "~/lib/utils"

import { api } from "~/trpc/react";

export default function ReplenishHistory() {
  const replenishHistory = api.kazna.getReplenishHistory.useQuery();

  return (
    <div className="flex flex-col gap-4">
      {replenishHistory.isFetching && (
        <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
      )}

      {!replenishHistory.isFetching &&
        replenishHistory.data?.map((replenish) => (
          <div
            className="flex justify-between items-center bg-accent py-2 px-4 rounded-md gap-44 max-w-[500px]"
            key={replenish.id}
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Image
                  src={replenish.sender.image}
                  width={32}
                  height={32}
                  alt="avatar"
                  className="rounded-full w-8"
                />

                <h1>
                  {replenish.sender.name.length > 10
                    ? replenish.sender.name.slice(0, 10)
                    : replenish.sender.name}
                </h1>
              </div>

              <div className="w-max max-w-[350px] text-wrap">
                {replenish.message.length > 45
                  ? replenish.message.slice(0, 45)
                  : replenish.message}
              </div>
            </div>

            <h1 className={cn("text-xl", replenish.amount > 0 ? "text-green-400" : "text-red-400")}>{replenish.amount}</h1>
          </div>
        ))}
    </div>
  );
}
