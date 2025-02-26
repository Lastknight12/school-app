import jwt from "jsonwebtoken";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { env } from "~/env";

import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

interface TokenData {
  randomChannelId: string;
  transactionId: string;
  count: number;
  products: {
    id: string;
    count: number;
  }[];
}

export const getItemsFromTokenInput = z.object({
  token: z.string().nullish(),
  productId: z.string().nullish(),
});

export async function getItemsFromTokenHandler(req: NextRequest) {
  const input = await getReqBody(req, getItemsFromTokenInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (!input.data.token && !input.data.productId) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Відутній токен або id продукту",
    });
  }

  if (input.data.productId) {
    const dbProduct = await db.categoryItem.findUnique({
      where: {
        id: input.data.productId,
      },
    });

    if (!dbProduct) {
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Невірний id продукту",
      });
    }

    return {
      products: [
        {
          id: dbProduct.id,
          count: 1,
          image: dbProduct.image,
          title: dbProduct.title,
          pricePerOne: dbProduct.pricePerOne,
          categoryId: dbProduct.categoryId,
        },
      ],
      totalAmount: dbProduct.pricePerOne,
    };
  }

  if (input.data.token) {
    const decryptedToken = jwt.verify(
      input.data.token,
      env.QR_SECRET,
    ) as TokenData;

    const [dbProducts, transaction] = await Promise.all([
      db.categoryItem.findMany({
        where: {
          id: {
            in: decryptedToken.products.map((product) => product.id),
          },
        },
      }),
      db.transaction.findUnique({
        where: {
          id: decryptedToken.transactionId,
        },
      }),
    ]);

    if (dbProducts.length === 0 || !transaction) {
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Невірний токен",
      });
    }

    if (transaction.status !== "PENDING") {
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Покупка завершена",
      });
    }

    return {
      products: dbProducts.map((product) => ({
        ...product,
        count:
          decryptedToken.products.find((item) => item.id === product.id)
            ?.count ?? 1,
      })),
      totalAmount: transaction.amount,
    };
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, getItemsFromTokenHandler);
}
