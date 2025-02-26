import { UserRole } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const updateUserRoleInput = z.object({
  userId: z.string(),
  newRole: z.enum([
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.SELLER,
    UserRole.RADIO_CENTER,
  ]),
});

export async function updateUserRoleHandler(req: NextRequest) {
  const input = await getReqBody(req, updateUserRoleInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.user.update({
    where: {
      id: input.data.userId,
    },
    data: {
      role: input.data.newRole,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, updateUserRoleHandler, ["ADMIN"]);
}
