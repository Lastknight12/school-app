import { type NextRequest } from "next/server";

import { db } from "~/server/db";

import { withAuth } from "~/lib/server";

export async function getAllKlassesHandler() {
  return await db.klass.findMany({
    select: {
      name: true,
    },
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, getAllKlassesHandler, ["ADMIN"]);
}
