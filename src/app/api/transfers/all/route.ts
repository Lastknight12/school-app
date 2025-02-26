import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getAllTransactionsHandler() {
  return (
    await db.transaction.findMany({
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
}

export async function GET(req: NextRequest) {
  return withAuth(req, getAllTransactionsHandler, ["ADMIN"]);
}
