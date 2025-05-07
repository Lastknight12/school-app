import jwt from "jsonwebtoken";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "~/env";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { pusher } from "~/lib/pusher-server";
import { ServerError, getReqBody, withAuth } from "~/lib/server";

export interface TokenData {
  randomChannelId: string;
  transactionId: string;
  count: number;
  products: {
    id: string;
    count: number;
  }[];
}

export const payInput = z.object({
  url: z.string().url({ message: "Невірний URL" }),
});

export async function payHandler(req: NextRequest, session: CustomUser) {
  const input = await getReqBody(req, payInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  const validDomain = new URL(env.NEXT_PUBLIC_BUY_URL).host;
  const parsedUrl = new URL(input.data.url);
  const params = parsedUrl.searchParams;

  if (
    parsedUrl.host !== validDomain ||
    (!params.has("productId") && !params.has("token"))
  ) {
    throw new ServerError({ message: "Невірний URL", code: "BAD_REQUEST" });
  }

  const processTransaction = async (
    amount: number,
    products: { id: string; count: number }[],
    transactionId?: string,
    randomChannelId?: string,
  ) => {
    if (session.balance < amount) {
      transactionId &&
        (await db.transaction.delete({ where: { id: transactionId } }));

      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Недостатньо коштів",
      });
    }

    const randomGradient = [
      { from: "#D99CFF", to: "#FFD0F2" },
      { from: "#FF9C9C", to: "#FF83CD" },
      { from: "#FFFB9C", to: "#FFB69F" },
      { from: "#C79CFF", to: "#9FBFFF" },
      { from: "#9CFFC3", to: "#9FDCFF" },
    ][Math.floor(Math.random() * 5)]!;

    if (transactionId && randomChannelId) {
      await pusher.trigger(randomChannelId, "pay", {
        error: null,
      });

      const promises = [
        db.transaction.update({
          where: { id: transactionId },
          data: {
            status: "SUCCESS",
            senderId: session.id,
          },
        }),

        db.user.update({
          where: {
            id: session.id,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        }),

        ...products.map((product) => {
          return db.categoryItem.update({
            where: { id: product.id },
            data: { count: { decrement: product.count } },
          });
        }),
      ];

      await Promise.all(promises);
    } else {
      const promises = [
        db.transaction.create({
          data: {
            amount,
            type: "BUY",
            randomGradient,
            status: "SUCCESS",
            senderId: session.id,
            productsBought: {
              connect: products.map((product) => ({ id: product.id })),
            },
          },
        }),

        db.categoryItem.update({
          where: { id: products[0]?.id },
          data: { count: { decrement: products[0]?.count } },
        }),
      ];
      await Promise.all(promises);
    }
  };

  if (params.has("productId")) {
    const productId = params.get("productId")!;
    const product = await db.categoryItem.findUnique({
      where: { id: productId },
    });

    if (!product)
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Невіриний Id продукту",
      });

    await processTransaction(product.pricePerOne, [
      { id: productId, count: 1 },
    ]);
  }

  if (params.has("token")) {
    const token = params.get("token")!;
    const { transactionId, products, randomChannelId } = jwt.verify(
      token,
      env.QR_SECRET,
    ) as TokenData;

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
    });
    const productIds = products.map((p) => p.id);

    if (
      !transaction ||
      transaction.status !== "PENDING" ||
      productIds.length === 0
    ) {
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Транзакція завершена або не знайдена",
      });
    }

    await processTransaction(
      transaction.amount,
      products,
      transactionId,
      randomChannelId,
    );
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, payHandler, ["STUDENT"]);
}
