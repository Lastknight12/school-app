import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getHistoryHandler() {
  return await db.kaznaTransfer.findMany({
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
}

export async function GET(req: NextRequest) {
  return withAuth(req, getHistoryHandler, ["ADMIN"]);
}
