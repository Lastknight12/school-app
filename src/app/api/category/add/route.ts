import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const addCategoryInput = z.object({
  categoryName: z.string().min(1, "Назва категорії не може бути пустою"),
});

export async function addCategoryHandler(req: NextRequest) {
  const input = await getReqBody(req, addCategoryInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  try {
    await db.category.create({
      data: {
        name: input.data.categoryName,
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Категорія вже існує",
        });
      }
    }
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, addCategoryHandler, ["SELLER"]);
}
