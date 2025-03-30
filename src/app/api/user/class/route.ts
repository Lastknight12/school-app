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
      code: "UNAUTHORIZED",
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
    return null;
  }

  return klass;
}

export async function GET(req: NextRequest) {
  return withAuth(req, getUserClassHandler, ["STUDENT"]);
}
