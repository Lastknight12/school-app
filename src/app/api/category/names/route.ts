import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getCategoryNamesHandler() {
  return await db.category.findMany({
    select: {
      name: true,
    },
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, getCategoryNamesHandler);
}
