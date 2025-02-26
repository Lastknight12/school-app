import { type NextRequest } from "next/server";
import { addKlassSchema } from "~/schemas/zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const addKlassInput = addKlassSchema;

export async function addKlassHandler(req: NextRequest) {
  const input = await getReqBody(req, addKlassInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const isExist = await db.klass.findFirst({
    where: {
      name: input.data.name,
    },
  });

  if (isExist) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Клас вже існує",
    });
  }

  await db.klass.create({
    data: {
      name: input.data.name,
      teachers: {
        connect: input.data.teacherIds.map((id) => ({ id })),
      },
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, addKlassHandler, ["ADMIN"]);
}
