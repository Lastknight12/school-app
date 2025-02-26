import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const updateUsersInput = z.object({
  klassId: z.string(),
  usersIds: z.array(z.string()).min(1, "Відсутній спискок Id користувачів"),
  usersRole: z.enum(["STUDENT", "TEACHER"]),
});

export async function updateUsersHandler(req: NextRequest) {
  const input = await getReqBody(req, updateUsersInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const users = await db.user.findMany({
    where: {
      id: {
        in: input.data.usersIds,
      },
      role: input.data.usersRole,
    },
  });

  if (users.length === 0) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Не знайдено жодного користувача за наданими Id",
    });
  }

  await db.klass.update({
    where: {
      id: input.data.klassId,
    },
    data: {
      teachers: input.data.usersRole === "TEACHER" ? { set: users } : undefined,
      students: input.data.usersRole === "STUDENT" ? { set: users } : undefined,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, updateUsersHandler, ["ADMIN"]);
}
