import { type NextRequest } from "next/server";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getStatsHandler(req: NextRequest, session: CustomUser) {
  const transfers = await db.user.findUnique({
    where: {
      id: session.id,
    },
    select: {
      senderTransactions: {
        select: {
          amount: true,
        },
      },
      recieverTransactions: {
        select: {
          amount: true,
        },
      },
    },
  });

  const incomingAmount = transfers?.recieverTransactions
    .reduce((acc, curr) => acc + curr.amount, 0)
    .toFixed(2);

  const outgoingAmount = transfers?.senderTransactions
    .reduce((acc, curr) => acc + curr.amount, 0)
    .toFixed(2);

  return {
    incoming: {
      amount: incomingAmount!,
      count: transfers?.recieverTransactions.length,
    },
    outgoing: {
      amount: outgoingAmount!,
      count: transfers?.senderTransactions.length,
    },
  };
}

export async function GET(req: NextRequest) {
  return withAuth(req, getStatsHandler);
}
