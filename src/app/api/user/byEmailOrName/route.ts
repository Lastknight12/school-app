import { type NextRequest } from "next/server";
import { z } from "zod";

import type { CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const getUsersByNameOrEmailInput = z.object({
  searchTerm: z.string(),
});

export async function getUsersByNameOrEmailHandler(
  req: NextRequest,
  session: CustomUser,
) {
  const input = await getReqBody(req, getUsersByNameOrEmailInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (input.data.searchTerm == "") return [];
  const users = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: input.data.searchTerm, mode: "insensitive" } },
        { name: { contains: input.data.searchTerm, mode: "insensitive" } },
      ],
      role:
        session.role === "ADMIN"
          ? {
              in: ["STUDENT", "TEACHER"],
            }
          : "STUDENT",
    },
  });

  return users;
}

export async function POST(req: NextRequest) {
  return withAuth(req, getUsersByNameOrEmailHandler);
}
