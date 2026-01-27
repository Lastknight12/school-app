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
    const transfers = await ctx.db.transaction.findMany({
      where: {
        sender: {
          role: "ADMIN",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        comment: true,
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
        reciever: {
          select: {
            name: true,
            image: true,
          },
        },
        createdAt: true,
      },
    });

    const replenishs = await ctx.db.kaznaTransfer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        comment: true,
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
        createdAt: true,
      },
    });

    return [
      ...transfers.map((t) => ({
        type: "TRANSFER",
        id: t.id,
        amount: t.amount,
        comment: t.comment,
        sender: t.sender,
        reciever: t.reciever,
        createdAt: t.createdAt,
      })),
      ...replenishs.map((r) => ({
        type: "REPLENISH",
        id: r.id,
        amount: r.amount,
        comment: r.comment,
        sender: r.sender,
        reciever: null,
        createdAt: r.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }),

  replenishKazna: authorizeRoles(["ADMIN"])
    .input(z.object({ amount: z.number(), comment: z.string() }))
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
          comment: input.comment,
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
