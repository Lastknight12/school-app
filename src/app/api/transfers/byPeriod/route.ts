import { addDays } from "date-fns";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getTransfersByPeriodInput = z.object({
  range: z.object({
    from: z.string(),
    to: z.string().nullish(),
  }),
});

export async function getTransfersByPeriodHandler(req: NextRequest) {
  const input = await getReqBody(req, getTransfersByPeriodInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const transfers = await db.transaction.findMany({
    where: {
      createdAt: {
        gte: new Date(input.data.range.from),
        // if user dont provide range.to, take transfers in range.from day
        lt: new Date(addDays(input.data.range.to ?? input.data.range.from, 1)),
      },
      type: "BUY",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
      amount: true,
      createdAt: true,
      status: true,
      productsBought: {
        select: {
          id: true,
          title: true,
          image: true,
          count: true,
          pricePerOne: true,
          Category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  transfers.forEach((transfer) => {
    transfer.createdAt = new Date(transfer.createdAt.setUTCHours(0, 0, 0, 0));
  });

  const totalAmount = transfers.reduce((total, transfer) => {
    return total + transfer.amount;
  }, 0);

  return {
    totalAmount,
    transfers,
  };
}

export async function POST(req: NextRequest) {
  return withAuth(req, getTransfersByPeriodHandler, ["ADMIN", "SELLER"]);
}
