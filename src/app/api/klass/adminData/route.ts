import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getAdminDataInput = z.object({ name: z.string() });

export async function getAdminDataHandler(req: NextRequest) {
  const input = await getReqBody(req, getAdminDataInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  return await db.klass.findFirst({
    where: {
      name: input.data.name,
    },
    select: {
      id: true,
      name: true,
      teachers: true,
      students: true,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, getAdminDataHandler, ["ADMIN"]);
}
