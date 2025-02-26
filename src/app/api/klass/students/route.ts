import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getKlassStudentsInput = z.object({ id: z.string() });

export async function getKlassStudentsHandler(req: NextRequest) {
  const input = await getReqBody(req, getKlassStudentsInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const klass = await db.klass.findFirst({
    where: {
      id: input.data.id,
    },
    select: {
      students: true,
    },
  });

  if (!klass?.students) {
    return [];
  }

  return klass.students;
}

export async function POST(req: NextRequest) {
  return withAuth(req, getKlassStudentsHandler, ["ADMIN"]);
}
