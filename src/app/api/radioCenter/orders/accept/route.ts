import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const acceptOrderInput = z.object({ id: z.string() });

export async function acceptOrderHandler(req: NextRequest) {
  const input = await getReqBody(req, acceptOrderInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const order = await db.musicOrder.update({
    where: {
      id: input.data.id,
    },
    data: {
      status: "ACCEPTED",
    },
  });

  return order.id;
}

export async function POST(req: NextRequest) {
  return withAuth(req, acceptOrderHandler, ["RADIO_CENTER"]);
}
