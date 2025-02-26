import { type NextRequest } from "next/server";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getChartDataHandler(_: NextRequest, session: CustomUser) {
  const transfers = await db.user.findUnique({
    where: {
      id: session.id,
    },
    select: {
      recieverTransactions: true,
      senderTransactions: true,
    },
  });

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const chartData = months.map((month) => {
    const incoming = transfers?.recieverTransactions
      .filter(
        (transfer) => transfer.createdAt.toISOString().split("-")[1] == month,
      )
      .reduce((acc, curr) => acc + curr.amount, 0);
    const outgoing = transfers?.senderTransactions
      .filter(
        (transfer) => transfer.createdAt.toISOString().split("-")[1] == month,
      )
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      month,
      incoming: incoming!,
      outgoing: outgoing!,
    };
  });

  return chartData;
}

export async function GET(req: NextRequest) {
  return withAuth(req, getChartDataHandler);
}
