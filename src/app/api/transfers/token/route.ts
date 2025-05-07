import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "~/env";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const genProductTokenInput = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      count: z.number(),
    }),
  ),
  type: z.enum(["infinity", "expires"]).default("expires"),
});

export async function genProductTokenHandler(req: NextRequest) {
  const input = await getReqBody(req, genProductTokenInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (
    (input.data.products.length > 1 || input.data.products[0]!.count > 1) &&
    input.data.type === "infinity"
  ) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Виберіть лише 1 продукт для створення нескінечного QR коду",
    });
  }

  // if type infinity generate qr code without token
  if (input.data.type === "infinity") {
    const buyUrl = `${env.NEXT_PUBLIC_BUY_URL}?productId=${input.data.products[0]?.id}`;

    return {
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${buyUrl}`,
      channel: null,
    };
  }

  if (input.data.type === "expires") {
    const dbProducts = await db.categoryItem.findMany({
      where: {
        id: {
          in: input.data.products.map((item) => item.id),
        },
      },
    });

    if (dbProducts.length === 0) {
      throw new ServerError({
        message: "Invalid product ID",
        code: "BAD_REQUEST",
      });
    }

    const randomGradient = [
      { from: "#D99CFF", to: "#FFD0F2" },
      { from: "#FF9C9C", to: "#FF83CD" },
      { from: "#FFFB9C", to: "#FFB69F" },
      { from: "#C79CFF", to: "#9FBFFF" },
      { from: "#9CFFC3", to: "#9FDCFF" },
    ][Math.floor(Math.random() * 5)]!;

    const amount = dbProducts.reduce((total, dbProduct) => {
      const productInput = input.data.products.find(
        ({ id }) => id === dbProduct.id,
      );

      return productInput
        ? total + dbProduct.pricePerOne * productInput.count
        : total;
    }, 0);

    const transaction = await db.transaction.create({
      data: {
        amount,
        type: "BUY",
        randomGradient,
        productsBought: {
          connect: input.data.products.map((item) => ({
            id: item.id,
          })),
        },
      },
    });

    const randomChannelId = randomUUID();

    const token = jwt.sign(
      {
        products: input.data.products,
        transactionId: transaction.id,
        randomChannelId: randomChannelId,
      },
      env.QR_SECRET,
    );

    const buyUrl = `${env.NEXT_PUBLIC_BUY_URL}?token=${token}`;

    return {
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${buyUrl}`,
      channel: randomChannelId,
    };
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, genProductTokenHandler, ["SELLER"]);
}
