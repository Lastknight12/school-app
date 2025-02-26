import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const updateCategoryInput = z.object({
  categoryName: z.string().min(1, "categoryName не може бути порожнім"),
  newName: z.string().min(1, "newName не може бути порожнім"),
});

export async function updateCategoryHandler(req: NextRequest) {
  const input = await getReqBody(req, updateCategoryInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.category.update({
    where: {
      name: input.data.categoryName,
    },
    data: {
      name: input.data.newName,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, updateCategoryHandler, ["SELLER"]);
}
