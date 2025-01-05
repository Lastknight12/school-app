import type { Transaction } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "~/env";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  sellerProcedure,
  studentProcedure,
} from "~/server/api/trpc";

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
  sendMoney: adminProcedure
    .input(
      z.object({
        receiverId: z.string().min(1, "receiverId не може бути порожнім"),
        amount: z.number().min(1, "amount не може бути менше 1"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userBalance = ctx.session.user.balance;

      if (userBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Недостатній баланс",
        });
      }

      if (input.receiverId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Неможливо перевести гроші самому собі",
        });
      }

      const reciever = await ctx.db.user.findUnique({
        where: {
          id: input.receiverId,
        },
      });

      if (!reciever) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Користувача не знайдено",
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
          success: true,
          amount: input.amount,
          randomGradient: randomColor,
        },
      });

      if (ctx.session.user.role === "ADMIN") {
        const kazna = await ctx.db.kazna.findFirst();

        if (!kazna) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Казна не знайдена",
          });
        }

        if (kazna.amount < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Недостатньо коштів в казні",
          });
        }

        const promises = [
          ctx.db.kaznaTransfer.create({
            data: {
              amount: input.amount * -1,
              message: `Переказ коштів користувачу ${reciever.name}`,
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
          }),

          ctx.db.kazna.update({
            where: {
              id: kazna.id,
            },
            data: {
              amount: {
                decrement: input.amount,
              },
            },
          }),
        ];

        await Promise.all(promises);
      } else {
        await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: {
              decrement: input.amount,
            },
            senderTransactions: {
              connect: {
                id: transaction.id,
              },
            },
          },
        });
      }

      await ctx.db.user.update({
        where: {
          id: input.receiverId,
        },
        data: {
          balance: {
            increment: input.amount,
          },
          recieverTransactions: {
            connect: {
              id: transaction.id,
            },
          },
        },
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
        productsBought: true,
        randomGradient: true,
        reciever: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
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
        recieverTransactions: true,
        senderTransactions: true,
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
      const incoming = transfers?.recieverTransactions
        .filter(
          (transfer) => transfer.createdAt.toISOString().split("-")[1] == month,
        )
        .reduce((acc, curr) => acc + curr.amount, 0);
      const outgoing = transfers?.senderTransactions
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
        senderTransactions: {
          select: {
            amount: true,
          },
        },
        recieverTransactions: {
          select: {
            amount: true,
          },
        },
      },
    });

    const incomingAmount = transfers?.recieverTransactions
      .reduce((acc, curr) => acc + curr.amount, 0)
      .toFixed(2);

    const outgoingAmount = transfers?.senderTransactions
      .reduce((acc, curr) => acc + curr.amount, 0)
      .toFixed(2);

    return {
      incoming: {
        amount: incomingAmount!,
        count: transfers?.recieverTransactions.length,
      },
      outgoing: {
        amount: outgoingAmount!,
        count: transfers?.senderTransactions.length,
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
        type: z.enum(["infinity", "expires"]).default("expires"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // validator
      if (
        (input.products.length > 1 || input.products[0]!.count > 1) &&
        input.type === "infinity"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Виберіть лише 1 продукт для створення нескінечного QR коду",
        });
      }

      // if type infinity generate qr code without token
      if (input.type === "infinity") {
        return {
          buyUrl: `${env.NEXT_PUBLIC_BUY_URL}?productId=${input.products[0]?.id}`,
          channel: "",
        };
      }

      if (input.type === "expires") {
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

        const randomGradient = [
          { from: "#D99CFF", to: "#FFD0F2" },
          { from: "#FF9C9C", to: "#FF83CD" },
          { from: "#FFFB9C", to: "#FFB69F" },
          { from: "#C79CFF", to: "#9FBFFF" },
          { from: "#9CFFC3", to: "#9FDCFF" },
        ][Math.floor(Math.random() * 5)]!;

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
            randomGradient,
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
          buyUrl: `${env.NEXT_PUBLIC_BUY_URL}?token=${token}`,
          channel: randomChannelId,
        };
      }
    }),

  pay: studentProcedure
    .input(
      z.object({
        url: z.string().url({ message: "Невірний URL" }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const validDomain = new URL(env.NEXT_PUBLIC_BUY_URL).host;
      const parsedUrl = new URL(input.url);
      const params = parsedUrl.searchParams;

      if (
        parsedUrl.host !== validDomain ||
        (!params.has("productId") && !params.has("token"))
      ) {
        throw new TRPCError({ message: "Невірний URL", code: "BAD_REQUEST" });
      }

      const processTransaction = async (
        amount: number,
        productIds: string[],
        transactionId?: string,
      ) => {
        if (ctx.session.user.balance < amount) {
          throw new TRPCError({
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

        if (transactionId) {
          await ctx.db.transaction.update({
            where: { id: transactionId },
            data: { success: true },
          });
        } else {
          await ctx.db.transaction.create({
            data: {
              amount,
              type: "BUY",
              randomGradient,
              success: true,
              senderId: ctx.session.user.id,
              productsBought: {
                connect: productIds.map((id) => ({ id })),
              },
            },
          });
        }

        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { balance: { decrement: amount } },
        });

        await Promise.all(
          productIds.map((id) =>
            ctx.db.categoryItem.update({
              where: { id },
              data: { count: { decrement: 1 } },
            }),
          ),
        );
      };

      if (params.has("productId")) {
        const productId = params.get("productId")!;
        const product = await ctx.db.categoryItem.findUnique({
          where: { id: productId },
        });

        if (!product)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Невіриний Id продукту",
          });

        await processTransaction(product.pricePerOne, [productId]);
      }

      if (params.has("token")) {
        const token = params.get("token")!;
        const { transactionId, products } = jwt.verify(
          token,
          env.QR_SECRET,
        ) as TokenData;

        const transaction = await ctx.db.transaction.findUnique({
          where: { id: transactionId },
        });
        const productIds = products.map((p) => p.id);

        if (!transaction || transaction.success || productIds.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Транзакція завершена або не знайдена",
          });
        }

        await processTransaction(transaction.amount, productIds, transactionId);
      }
    }),

  getTransfersByPeriod: adminProcedure
    .input(
      z.object({
        range: z.object({
          from: z.string(),
          to: z.string().nullish(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const transfers = await ctx.db.transaction.findMany({
        where: {
          createdAt: {
            gte: new Date(input.range.from),
            // if user dont provide range.to, take transfers in range.from day
            lt: new Date(addDays(input.range.to ?? input.range.from, 1)),
          },
          type: "BUY",
          success: true,
        },
        select: {
          id: true,
          sender: true,
          amount: true,
          createdAt: true,
          success: true,
          productsBought: true,
        },
      });

      const totalAmount = transfers.reduce((total, transfer) => {
        return total + transfer.amount;
      }, 0);

      return {
        totalAmount,
        transfers,
      };
    }),
});
