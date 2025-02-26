import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const deleteOrderInput = z.object({ id: z.string() });

export async function deleteOrderHandler(req: NextRequest) {
  const input = await getReqBody(req, deleteOrderInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.musicOrder.delete({
    where: {
      id: input.data.id,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, deleteOrderHandler, ["RADIO_CENTER"]);
}
