import { type NextRequest } from "next/server";
import { z } from "zod";

import { type CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export async function getReplenishHandler() {
  return await db.kaznaTransfer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      message: true,
      sender: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
}

export const replenishInput = z.object({
  amount: z.number(),
  message: z.string(),
});

export async function replenishHandler(req: NextRequest, session: CustomUser) {
  const input = await getReqBody(req, replenishInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const kazna = await db.kazna.findFirst({
    select: {
      id: true,
    },
  });

  if (!kazna?.id) {
    throw new ServerError({
      code: "NOT_FOUND",
      message: "Казна не знайдена",
    });
  }

  await db.kaznaTransfer.create({
    data: {
      amount: input.data.amount,
      message: input.data.message,
      Kazna: {
        connect: {
          id: kazna.id,
        },
      },
      sender: {
        connect: {
          id: session.id,
        },
      },
    },
  });

  await db.kazna.update({
    where: {
      id: kazna.id,
    },
    data: {
      amount: {
        increment: input.data.amount,
      },
    },
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, getReplenishHandler, ["ADMIN"]);
}

export async function POST(req: NextRequest) {
  return withAuth(req, replenishHandler, ["ADMIN"]);
}
