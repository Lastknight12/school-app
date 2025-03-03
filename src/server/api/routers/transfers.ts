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
  customProcedure,
  protectedProcedure,
  sellerProcedure,
  studentProcedure,
} from "~/server/api/trpc";

export interface TokenData {
  randomChannelId: string;
  transactionId: string;
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
        receiverId: z.string().min(1, "receiverId не може бути порожнім"),
        amount: z.number().min(1, "amount не може бути менше 1"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.user.role !== "ADMIN" &&
        ctx.session.user.role !== "TEACHER"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Недостатньо прав",
        });
      }
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
          status: "PENDING",
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

  getTransfers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(3).max(50).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;

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
        orderBy: {
          createdAt: "desc",
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.limit ? input.limit + 1 : undefined,
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

      let nextCursor: string | undefined = undefined;
      if (transfers.length > limit) {
        const nextItem = transfers.pop();
        nextCursor = nextItem!.id;
      }

      return { transfers, nextCursor };
    }),

  getAllTransactions: adminProcedure.query(async ({ ctx }) => {
    return (
      await ctx.db.transaction.findMany({
        where: {
          type: "TRANSFER",
        },
        select: {
          id: true,
          reciever: {
            select: {
              name: true,
            },
          },
          sender: {
            select: {
              name: true,
            },
          },
          type: true,
          amount: true,
          createdAt: true,
        },
      })
    ).reverse();
  }),

  deleteTransaction: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const isTransactionExist = await ctx.db.transaction.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!isTransactionExist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Такої транзакції не існує",
        });
      }

      await ctx.db.transaction.delete({
        where: {
          id: input.id,
        },
      });
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

  genProductToken: sellerProcedure
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
        const buyUrl = `${env.NEXT_PUBLIC_BUY_URL}?productId=${input.products[0]?.id}`;

        return {
          qr: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${buyUrl}`,
          channel: null,
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
          const productInput = input.products.find(
            ({ id }) => id === dbProduct.id,
          );

          return productInput
            ? total + dbProduct.pricePerOne * productInput.count
            : total;
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
            transactionId: transaction.id,
            randomChannelId: randomChannelId,
          },
          env.QR_SECRET,
        );

        const buyUrl = `${env.NEXT_PUBLIC_BUY_URL}?token=${token}`;

        return {
          qr: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${buyUrl}`,
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
        products: { id: string; count: number }[],
        transactionId?: string,
        randomChannelId?: string,
      ) => {
        if (ctx.session.user.balance < amount) {
          transactionId &&
            (await ctx.db.transaction.delete({ where: { id: transactionId } }));

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

        if (transactionId && randomChannelId) {
          await ctx.pusher.trigger(randomChannelId, "pay", {
            error: null,
          });

          const promises = [
            ctx.db.transaction.update({
              where: { id: transactionId },
              data: {
                status: "SUCCESS",
                senderId: ctx.session.user.id,
                productsBought: {
                  connect: products.map((product) => ({ id: product.id })),
                },
              },
            }),

            ctx.db.user.update({
              where: {
                id: ctx.session.user.id,
              },
              data: {
                balance: {
                  decrement: amount,
                },
              },
            }),

            ...products.map((product) => {
              return ctx.db.categoryItem.update({
                where: { id: product.id },
                data: { count: { decrement: product.count } },
              });
            }),
          ];

          await Promise.all(promises);
        } else {
          const promises = [
            ctx.db.transaction.create({
              data: {
                amount,
                type: "BUY",
                randomGradient,
                status: "SUCCESS",
                senderId: ctx.session.user.id,
                productsBought: {
                  connect: products.map((product) => ({ id: product.id })),
                },
              },
            }),

            ctx.db.categoryItem.update({
              where: { id: products[0]?.id },
              data: { count: { decrement: products[0]?.count } },
            }),
          ];
          await Promise.all(promises);
        }
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

        const transaction = await ctx.db.transaction.findUnique({
          where: { id: transactionId },
        });
        const productIds = products.map((p) => p.id);

        if (
          !transaction ||
          transaction.status !== "PENDING" ||
          productIds.length === 0
        ) {
          throw new TRPCError({
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
    }),

  getTransfersByPeriod: customProcedure(["ADMIN", "SELLER"])
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
        },
        select: {
          id: true,
          sender: true,
          amount: true,
          createdAt: true,
          status: true,
          productsBought: {
            select: {
              id: true,
              title: true,
              image: true,
              pricePerOne: true,
              count: true,
              Category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      transfers.forEach((transfer) => {
        transfer.createdAt = new Date(
          transfer.createdAt.setUTCHours(0, 0, 0, 0),
        );
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
