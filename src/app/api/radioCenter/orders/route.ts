import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getMusicOrdersHandler() {
  return await db.musicOrder.findMany({
    where: {
      status: "DELIVERED",
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
}

export async function GET(req: NextRequest) {
  return withAuth(req, getMusicOrdersHandler, ["RADIO_CENTER"]);
}
