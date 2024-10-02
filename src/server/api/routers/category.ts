import { z } from "zod";
import { createTRPCRouter, protectedProcedure, sellerProcedure } from "../trpc";
import jwt from "jsonwebtoken";
import { type TokenData } from "./transfers";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export const categoryRouter = createTRPCRouter({
  getCategoryItems: protectedProcedure
    .input(z.object({ categoryName: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.category.findUnique({
        where: {
          name: input.categoryName,
        },
        select: {
          items: true,
        },
      });

      return data?.items;
    }),

  getCategoryNames: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.category.findMany({
      select: {
        name: true,
      },
    });
  }),

  decrementProductsCount: sellerProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          count: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      void input.map(async (product) => {
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
        env.QR_SECRET,
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

  updateProduct: sellerProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        imageSrc: z.string().url(),
        count: z.number(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryItem.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          image: input.imageSrc,
          count: input.count,
          pricePerOne: input.price,
        },
      });
    }),

  deleteProduct: sellerProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryItem.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
