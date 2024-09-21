import {
  createTRPCRouter,
  protectedProcedure,
  sellerProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Transaction } from "@prisma/client";

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "~/env";

export interface TokenData {
  randomChannelId: string;
  transactionId: string;
  totalAmount: number;
  count: number;
  products: {
    id: string;
    count: number;
  }[];
}

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
          type: "TRANSFER",
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

      {
        ctx.session.user.role === "STUDENT" &&
          (await ctx.db.user.update({
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
          }));
      }

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
        });
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
        type: true,
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

  generateProductToken: sellerProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            id: z.string(),
            count: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dbProducts = await ctx.db.categoryItem.findMany({
        where: {
          id: {
            in: input.products.map((item) => item.id),
          },
        },
      });

      if (dbProducts.length === 0) {
        throw new TRPCError({
          message: "Invalid product ID",
          code: "BAD_REQUEST",
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

      const amount = dbProducts.reduce((total, dbProduct) => {
        // Find the corresponding product from the input array
        const productInput = input.products.find(
          (product) => product.id === dbProduct.id,
        );

        // If the product exists in the input array, calculate the price
        if (productInput) {
          total += dbProduct.pricePerOne * productInput.count;
        }

        return total;
      }, 0);

      const transaction = await ctx.db.transaction.create({
        data: {
          amount,
          type: "BUY",
          randomGradient: randomColor,
        },
      });

      const randomChannelId = randomUUID();

      const token = jwt.sign(
        {
          products: input.products,
          totalAmount: amount,
          transactionId: transaction.id,
          randomChannelId: randomChannelId,
        },
        env.QR_SECRET,
      );

      return {
        token,
        channel: randomChannelId,
      };
    }),

  pay: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const decryptedToken = jwt.verify(
        input.token,
        env.QR_SECRET,
      ) as TokenData;

      const [transaction, products] = await Promise.all([
        ctx.db.transaction.findUnique({
          where: {
            id: decryptedToken.transactionId,
          },
        }),
        ctx.db.categoryItem.findMany({
          where: {
            id: {
              in: decryptedToken.products.map((product) => product.id),
            },
          },
        }),
      ]);

      if (!transaction || products.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Транзакція або товари не були знайдені",
        });
      }

      if (transaction.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Транзакція завершена",
        });
      }

      if (ctx.session.user.balance < transaction.amount) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ctx.pusher.trigger(decryptedToken.randomChannelId, "pay", {
          error: "Недостатньо коштів",
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Недостатньо коштів",
        });
      }

      await Promise.all([
        ctx.db.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            sender: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            success: true,
          },
        }),

        void ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: {
              decrement: transaction.amount,
            },
          },
        }),
      ]);

      void ctx.pusher.trigger(decryptedToken.randomChannelId, "pay", {});
    }),
});
