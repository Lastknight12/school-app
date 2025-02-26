import { type NextRequest } from "next/server";
import { updateUserSchema } from "~/schemas/zod";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const updateUserInput = updateUserSchema;

export async function updateUserHandler(req: NextRequest, session: CustomUser) {
  const input = await getReqBody(req, updateUserInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.user.update({
    where: {
      id: session.id,
    },
    data: {
      name: input.data.newName,
      image: input.data.newImageSrc,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, updateUserHandler);
}
