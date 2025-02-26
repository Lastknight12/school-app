import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getTeacherDataInput = z.object({ id: z.string() });

export async function getTeacherDataHandler(req: NextRequest) {
  const input = await getReqBody(req, getTeacherDataInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  return await db.klass.findUnique({
    where: {
      id: input.data.id,
    },
    select: {
      id: true,
      name: true,
      students: true,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, getTeacherDataHandler, ["TEACHER"]);
}
