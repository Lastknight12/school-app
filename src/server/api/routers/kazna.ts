import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authorizeRoles, createTRPCRouter } from "../trpc";

export const kaznaRouter = createTRPCRouter({
  getKaznaAmount: authorizeRoles(["ADMIN"]).query(async ({ ctx }) => {
    const kazna = await ctx.db.kazna.findFirst();

    if (!kazna) {
      await ctx.db.kazna.create({
        data: {
          amount: 0,
        },
      });

      return 0;
    }

    return kazna.amount;
  }),

  getReplenishHistory: authorizeRoles(["ADMIN"]).query(async ({ ctx }) => {
    return await ctx.db.kaznaTransfer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        message: true,
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });
  }),

  replenishKazna: authorizeRoles(["ADMIN"])
    .input(z.object({ amount: z.number(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.amount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Сума повинна бути більшою за 0",
        });
      }

      const kazna = await ctx.db.kazna.findFirst({
        select: {
          id: true,
        },
      });

      if (!kazna?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Казна не знайдена",
        });
      }

      await ctx.db.kaznaTransfer.create({
        data: {
          amount: input.amount,
          message: input.message,
          Kazna: {
            connect: {
              id: kazna.id,
            },
          },
          sender: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      await ctx.db.kazna.update({
        where: {
          id: kazna.id,
        },
        data: {
          amount: {
            increment: input.amount,
          },
        },
      });
    }),
});
