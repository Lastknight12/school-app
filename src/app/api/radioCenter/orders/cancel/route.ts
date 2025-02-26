import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const cancelOrderInput = z.object({ id: z.string() });

export async function cancelOrderHandler(req: NextRequest) {
  const input = await getReqBody(req, cancelOrderInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      cause: "TypeError",
    });
  }

  await db.musicOrder.update({
    where: {
      id: input.data.id,
    },
    data: {
      status: "CANCELLED",
    },
    select: {
      id: true,
      musicImage: true,
      buyer: {
        select: {
          id: true,
          name: true,
        },
      },
      status: true,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, cancelOrderHandler, ["RADIO_CENTER"]);
}
