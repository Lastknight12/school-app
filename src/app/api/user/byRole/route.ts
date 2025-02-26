import { UserRole } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getUsersByRoleInput = z.object({
  role: z
    .enum([
      UserRole.STUDENT,
      UserRole.TEACHER,
      UserRole.ADMIN,
      UserRole.SELLER,
      UserRole.RADIO_CENTER,
    ])
    .optional(),
});

export async function getUsersByRoleHandler(req: NextRequest) {
  const input = await getReqBody(req, getUsersByRoleInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  return await db.user.findMany({
    where: {
      role: input.data.role ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      image: true,
      role: true,
      studentClass: {
        select: {
          id: true,
          name: true,
        },
      },
      teacherClasses: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, getUsersByRoleHandler, ["ADMIN"]);
}
