import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const deleteUserInput = z.object({ id: z.string() });

export async function deleteUserHandler(req: NextRequest) {
  const input = await getReqBody(req, deleteUserInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const userExist = await db.user.findUnique({
    where: {
      id: input.data.id,
    },
  });

  if (!userExist) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Користувача не існує",
    });
  }

  await db.user.delete({
    where: {
      id: input.data.id,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, deleteUserHandler);
}
