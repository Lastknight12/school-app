import { z } from "zod";
import { createTRPCRouter, protectedProcedure, sellerProcedure } from "../trpc";
import jwt from "jsonwebtoken";
import { TokenData } from "./transfers";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  getCategoryItems: protectedProcedure
    .input(z.object({ categoryName: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.category.findFirst({
        where: {
          name: input.categoryName,
        },
        select: {
          items: true,
        },
      });
    }),

  decrementProductsCount: sellerProcedure
    .input(z.array(z.object({ id: z.string(), count: z.number() })))
    .mutation(async ({ ctx, input }) => {
      input.forEach(async (product) => {
        await ctx.db.categoryItem.update({
          where: {
            id: product.id,
          },
          data: {
            count: {
              decrement: product.count,
            },
          },
        });
      });
    }),

  getItemsByToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const decryptedToken = jwt.verify(
        input.token,
        process.env.QR_SECRET as string,
      ) as TokenData;

      const [dbProducts, transaction] = await Promise.all([
        ctx.db.categoryItem.findMany({
          where: {
            id: {
              in: decryptedToken.products.map((product) => product.id),
            },
          },
        }),
        ctx.db.transaction.findUnique({
          where: {
            id: decryptedToken.transactionId,
          },
        }),
      ]);

      if (transaction?.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Транакція завершена",
        });
      }

      if (dbProducts.length === 0) {
        return null;
      }

      return {
        products: dbProducts.map((product) => {
          const productCount = decryptedToken.products.find(
            (item) => item.id === product.id,
          );

          if (!productCount)
            return {
              ...product,
              count: 1,
            };

          return {
            ...product,
            count: productCount.count,
          };
        }),
        totalAmount: decryptedToken.totalAmount,
      };
    }),
});
