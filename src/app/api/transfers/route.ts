import { type NextRequest } from "next/server";

import { type CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getTransfersHandler(
  req: NextRequest,
  session: CustomUser,
) {
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

  return transfers.reverse();
}

export async function GET(req: NextRequest) {
  return withAuth(req, getTransfersHandler);
}
