import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getKaznaAmountHandler() {
  const kazna = await db.kazna.findFirst();

  if (!kazna) {
    await db.kazna.create({
      data: {
        amount: 0,
      },
    });

    return 0;
  }

  return kazna.amount;
}

export async function GET(req: NextRequest) {
  return withAuth(req, getKaznaAmountHandler, ["ADMIN"]);
}
