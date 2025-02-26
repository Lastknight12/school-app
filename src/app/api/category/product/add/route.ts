import { type NextRequest } from "next/server";
import { addProductSchema } from "~/schemas/zod";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const addProductInput = addProductSchema;

export async function addProductHandler(req: NextRequest) {
  const input = await getReqBody(req, addProductInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  await db.categoryItem.create({
    data: {
      title: input.data.title,
      image: input.data.imageSrc,
      count: input.data.count,
      pricePerOne: input.data.price,
      Category: {
        connect: {
          name: input.data.category,
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, addProductHandler, ["SELLER"]);
}
