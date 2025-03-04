import { type NextRequest } from "next/server";
import { z } from "zod";

import { type CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { getReqBody, withAuth } from "~/lib/server";

export const getTransfersInput = z.object({
  limit: z.number().min(3).max(50).nullish(),
  cursor: z.string().nullish(),
});

export async function getTransfersHandler(
  req: NextRequest,
  session: CustomUser,
) {
  const input = await getReqBody(req, getTransfersInput);

  const limit = input.data?.limit ?? 50;

  const transfers = await db.transaction.findMany({
    where: {
      OR: [
        {
          senderId: session.id,
        },
        {
          recieverId: session.id,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    cursor: input.data?.cursor ? { id: input.data.cursor } : undefined,
    take: input.data?.limit ? input.data.limit + 1 : undefined,
    select: {
      id: true,
      productsBought: true,
      randomGradient: true,
      reciever: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      type: true,
      amount: true,
      createdAt: true,
    },
  });

  let nextCursor: string | undefined = undefined;
  if (transfers.length > limit) {
    const nextItem = transfers.pop();
    nextCursor = nextItem!.id;
  }

  return { transfers, nextCursor };
}

export async function POST(req: NextRequest) {
  return withAuth(req, getTransfersHandler);
}
