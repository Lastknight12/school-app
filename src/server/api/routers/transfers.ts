import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Transaction } from "@prisma/client";

export interface formatedTransfer extends Transaction {
  randomGradient: {
    from: string;
    to: string;
  };
}

export const transfersRouter = createTRPCRouter({
  sendMoney: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userBalance = ctx.session.user.balance;

      if (ctx.session.user.role === "STUDENT" && userBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Недостатній баланс",
        });
      }

      const colors = [
        { from: "#D99CFF", to: "#FFD0F2" },
        { from: "#FF9C9C", to: "#FF83CD" },
        { from: "#FFFB9C", to: "#FFB69F" },
        { from: "#C79CFF", to: "#9FBFFF" },
        { from: "#9CFFC3", to: "#9FDCFF" },
      ];

      const randomColor = colors[Math.floor(Math.random() * colors.length)]!;

      const transaction = await ctx.db.transaction.create({
        data: {
          reciever: {
            connect: {
              id: input.receiverId,
            },
          },
          sender: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          amount: input.amount,
          randomGradient: randomColor,
        },
      });

      await Promise.all([
        ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: {
              decrement: input.amount,
            },
            senderIn: {
              connect: {
                id: transaction.id,
              },
            },
          },
        }),
        ctx.db.user
          .update({
            where: {
              id: input.receiverId,
            },
            data: {
              balance: {
                increment: input.amount,
              },
              recieverIn: {
                connect: {
                  id: transaction.id,
                },
              },
            },
          })
          .catch((err) => {
            if (err instanceof PrismaClientKnownRequestError) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Надішліть повідомлення адміністратору, ${err.message}`,
              });
            }
          }),
      ]);
    }),

  getTransfers: protectedProcedure.query(async ({ ctx }) => {
    const transfers = await ctx.db.transaction.findMany({
      where: {
        OR: [
          {
            senderId: ctx.session.user.id,
          },
          {
            recieverId: ctx.session.user.id,
          },
        ],
      },
      select: {
        id: true,
        randomGradient: true,
        reciever: {
          select: {
            name: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        amount: true,
        createdAt: true,
      },
    });

    return transfers.reverse();
  }),

  getChartData: protectedProcedure.query(async ({ ctx }) => {
    const transfers = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        senderIn: true,
        recieverIn: true,
      },
    });

    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];

    const chartData = months.map((month) => {
      const incoming = transfers?.recieverIn
        .filter(
          (transfer) => transfer.createdAt.toISOString().split("-")[1] == month,
        )
        .reduce((acc, curr) => acc + curr.amount, 0);
      const outgoing = transfers?.senderIn
        .filter(
          (transfer) => transfer.createdAt.toISOString().split("-")[1] == month,
        )
        .reduce((acc, curr) => acc + curr.amount, 0);

      return {
        month,
        incoming: incoming!,
        outgoing: outgoing!,
      };
    });

    return chartData;
  }),

  getStatsData: protectedProcedure.query(async ({ ctx }) => {
    const transfers = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        senderIn: {
          select: {
            amount: true,
          },
        },
        recieverIn: {
          select: {
            amount: true,
          },
        },
      },
    });

    const incomingAmount = transfers?.recieverIn
      .reduce((acc, curr) => acc + curr.amount, 0)
      .toFixed(2);

    const outgoingAmount = transfers?.senderIn
      .reduce((acc, curr) => acc + curr.amount, 0)
      .toFixed(2);

    return {
      incoming: {
        amount: incomingAmount!,
        count: transfers?.recieverIn.length,
      },
      outgoing: {
        amount: outgoingAmount!,
        count: transfers?.senderIn.length,
      },
    };
  }),
});
