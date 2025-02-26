import { type NextRequest } from "next/server";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { ServerError, withAuth } from "~/lib/server";

export async function getUserClassHandler(
  req: NextRequest,
  session: CustomUser,
) {
  if (session.role !== "STUDENT")
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Дозволена роль: STUDENT",
    });

  if (!session.studentClass) return;

  const klass = await db.klass.findUnique({
    where: {
      id: session.studentClass.id,
    },
    select: {
      id: true,
      students: {
        select: {
          id: true,
        },
      },
      name: true,
    },
  });

  if (!klass?.students.some((student) => student.id === session.id)) {
    throw new ServerError({
      code: "UNAUTHORIZED",
      message: "Ти не знаходишся у цьому класі",
    });
  }

  return klass;
}

export async function GET(req: NextRequest) {
  return withAuth(req, getUserClassHandler, ["STUDENT"]);
}
