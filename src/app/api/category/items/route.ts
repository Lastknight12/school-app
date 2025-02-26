import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export type uploadImageRes = {
  error?: string;
  imageUrl: string;
};

export const getCategoryItemsInput = z.object({
  categoryName: z
    .string()
    .min(1, { message: "categoryName не може бути порожнім" }),
  searchFilter: z.string().nullish(),
});

export async function getCategoryItemsHandler(req: NextRequest) {
  const input = await getReqBody(req, getCategoryItemsInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const data = await db.category.findUnique({
    where: {
      name: input.data.categoryName,
    },
    select: {
      items: true,
    },
  });

  if (input.data.searchFilter) {
    return data?.items.filter((item) =>
      item.title.toLowerCase().includes(input.data.searchFilter!.toLowerCase()),
    );
  } else {
    return data?.items;
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, getCategoryItemsHandler);
}
