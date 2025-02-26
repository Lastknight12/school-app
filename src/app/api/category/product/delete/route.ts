import { type NextRequest } from "next/server";
import { z } from "zod";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

export const deleteProductInput = z.object({ id: z.string() });

export async function deleteProductHandler(req: NextRequest) {
  const input = await getReqBody(req, deleteProductInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }
}

export async function POST(req: NextRequest) {
  return withAuth(req, deleteProductHandler);
}
