import { type NextRequest } from "next/server";
import { z } from "zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const updateProductInput = z.object({
  id: z.string().min(1, "id не може бути порожнім"),
  title: z.string().min(1, "title не може бути порожнім"),
  imageSrc: z.string().url().min(1, "imageSrc не може бути порожнім"),
  count: z.number(),
  price: z.number(),
});

export async function updateProductHandler(req: NextRequest) {
  const input = await getReqBody(req, updateProductInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if ((input.data.price || input.data.count) < 0) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Ціна або кількість не можуть бути відємними",
    });
  }

  await db.categoryItem.update({
    where: {
      id: input.data.id,
    },
    data: {
      title: input.data.title,
      image: input.data.imageSrc,
      count: input.data.count,
      pricePerOne: input.data.price,
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, updateProductHandler, ["SELLER"]);
}
