import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getCurrentQueueHandler() {
  const orders = await db.musicOrder.findMany({
    where: {
      status: "ACCEPTED",
    },
    // limit orders
    take: 10,
    select: {
      id: true,
      status: true,
      musicUrl: true,
      musicTitle: true,
      musicImage: true,
      buyer: {
        select: {
          name: true,
        },
      },
    },
  });

  const currentTrack = orders.shift();

  return {
    playerQueue: orders,
    currentTrack,
  };
}

export async function GET(req: NextRequest) {
  return withAuth(req, getCurrentQueueHandler);
}
