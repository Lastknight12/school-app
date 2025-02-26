import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getLeaderboardInput = z.object({
  limit: z.number().min(3).max(50).nullish(),
  cursor: z.string().nullish(),
});

export async function getLeaderboardHandler(req: NextRequest) {
  const input = await getReqBody(req, getLeaderboardInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const limit = input.data.limit ?? 50;

  const users = await db.user.findMany({
    where: {
      role: "STUDENT",
    },
    cursor: input.data.cursor ? { id: input.data.cursor } : undefined,
    take: input.data.limit ? input.data.limit + 1 : undefined,
    orderBy: {
      balance: "desc",
    },
    select: {
      id: true,
      name: true,
      image: true,
      balance: true,
    },
  });

  let nextCursor: string | undefined = undefined;
  if (users.length > limit) {
    const nextItem = users.pop();
    nextCursor = nextItem!.id;
  }

  return {
    users,
    nextCursor,
  };
}

export async function POST(req: NextRequest) {
  return withAuth(req, getLeaderboardHandler);
}
