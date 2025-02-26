import { type NextRequest } from "next/server";
import { z } from "zod";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const sendMoneyInput = z.object({
  receiverId: z.string().min(1, "receiverId не може бути порожнім"),
  amount: z.number().min(1, "amount не може бути менше 1"),
});

export async function sendMoneyHandler(req: NextRequest, session: CustomUser) {
  const input = await getReqBody(req, sendMoneyInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (session.role !== "ADMIN" && session.role !== "TEACHER") {
    throw new ServerError({
      code: "UNAUTHORIZED",
      message: "Недостатньо прав",
    });
  }
  const userBalance = session.balance;

  if (userBalance < input.data.amount) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Недостатній баланс",
    });
  }

  if (input.data.receiverId === session.id) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Неможливо перевести гроші самому собі",
    });
  }

  const reciever = await db.user.findUnique({
    where: {
      id: input.data.receiverId,
    },
  });

  if (!reciever) {
    throw new ServerError({
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

  const transaction = await db.transaction.create({
    data: {
      type: "TRANSFER",
      reciever: {
        connect: {
          id: input.data.receiverId,
        },
      },
      sender: {
        connect: {
          id: session.id,
        },
      },
      status: "PENDING",
      amount: input.data.amount,
      randomGradient: randomColor,
    },
  });

  if (session.role === "ADMIN") {
    const kazna = await db.kazna.findFirst();

    if (!kazna) {
      throw new ServerError({
        code: "NOT_FOUND",
        message: "Казна не знайдена",
      });
    }

    if (kazna.amount < input.data.amount) {
      throw new ServerError({
        code: "BAD_REQUEST",
        message: "Недостатньо коштів в казні",
      });
    }

    const promises = [
      db.kaznaTransfer.create({
        data: {
          amount: input.data.amount * -1,
          message: `Переказ коштів користувачу ${reciever.name}`,
          Kazna: {
            connect: {
              id: kazna.id,
            },
          },
          sender: {
            connect: {
              id: session.id,
            },
          },
        },
      }),

      db.kazna.update({
        where: {
          id: kazna.id,
        },
        data: {
          amount: {
            decrement: input.data.amount,
          },
        },
      }),
    ];

    await Promise.all(promises);
  } else {
    await db.user.update({
      where: {
        id: session.id,
      },
      data: {
        balance: {
          decrement: input.data.amount,
        },
        senderTransactions: {
          connect: {
            id: transaction.id,
          },
        },
      },
    });
  }

  await db.user.update({
    where: {
      id: input.data.receiverId,
    },
    data: {
      balance: {
        increment: input.data.amount,
      },
      recieverTransactions: {
        connect: {
          id: transaction.id,
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, sendMoneyHandler);
}
