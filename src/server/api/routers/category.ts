import { z } from "zod";
import { createTRPCRouter, protectedProcedure, sellerProcedure } from "../trpc";
import jwt from "jsonwebtoken";
import { type TokenData } from "./transfers";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { addProductSchema } from "~/schemas/zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const categoryRouter = createTRPCRouter({
  getCategoryItems: protectedProcedure
    .input(
      z.object({
        categoryName: z.string().min(1, "categoryName не може бути порожнім"),
        searchFilter: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.category.findUnique({
        where: {
          name: input.categoryName,
        },
        select: {
          items: true,
        },
      });

      if (input.searchFilter) {
        return data?.items.filter((item) =>
          item.title.toLowerCase().includes(input.searchFilter!.toLowerCase()),
        );
      } else {
        return data?.items;
      }
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
    .input(z.object({ token: z.string().min(1, "token не може бути порожнім") }))
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
        id: z.string().min(1, "id не може бути порожнім"),
        title: z.string().min(1, "title не може бути порожнім"),
        imageSrc: z.string().url().min(1, "imageSrc не може бути порожнім"),
        count: z.number().min(1, "count не може бути порожнім"),
        price: z.number().min(1, "price не може бути порожнім"),
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
        id: z.string().min(1, "id не може бути порожнім"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryItem.delete({
        where: {
          id: input.id,
        },
      });
    }),

  addProduct: sellerProcedure
    .input(addProductSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryItem.create({
        data: {
          title: input.title,
          image: input.imageSrc,
          count: input.count,
          pricePerOne: input.price,
          Category: {
            connect: {
              name: input.category,
            },
          },
        },
      });
    }),

  addCategory: sellerProcedure
    .input(
      z.object({
        categoryName: z.string().min(1, "categoryName не може бути порожнім"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.category.create({
          data: {
            name: input.categoryName,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Категорія вже існує",
            });
          }
        }
      }
    }),

  deleteCategory: sellerProcedure
    .input(
      z.object({
        categoryName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.categoryItem.deleteMany({
        where: {
          Category: {
            name: input.categoryName,
          },
        },
      });

      await ctx.db.category.delete({
        where: {
          name: input.categoryName,
        },
      });
    }),

  updateCategory: sellerProcedure
    .input(
      z.object({
        categoryName: z.string().min(1, "categoryName не може бути порожнім"),
        newName: z.string().min(1, "newName не може бути порожнім"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.category.update({
        where: {
          name: input.categoryName,
        },
        data: {
          name: input.newName,
        },
      });
    }),
});
