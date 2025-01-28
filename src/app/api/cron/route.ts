import type { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const usersIds = await db.user.findMany({
    select: {
      id: true,
    },
  });

  await db.user.updateMany({
    where: {
      id: {
        in: usersIds.map((user) => user.id),
      },
    },
    data: {
      balance: 0,
    },
  });

  return new NextResponse(
    "Success",
    { status: 200 }
  )
}
