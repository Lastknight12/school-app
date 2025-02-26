import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const deleteCategoryInput = z.object({
  categoryName: z.string().min(1, "Назва категорії не може бути пустою"),
});

export async function deleteCategoryHandler(req: NextRequest) {
  const input = await getReqBody(req, deleteCategoryInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.categoryItem.deleteMany({
    where: {
      Category: {
        name: input.data.categoryName,
      },
    },
  });

  await db.category.delete({
    where: {
      name: input.data.categoryName,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, deleteCategoryHandler, ["SELLER"]);
}
