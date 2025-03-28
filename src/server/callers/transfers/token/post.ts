import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import {
  type genProductTokenHandler,
  type genProductTokenInput,
} from "~/app/api/transfers/token/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof genProductTokenHandler>>;

type Props = z.infer<typeof genProductTokenInput>;

const genProductTokenFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/token", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/token");
  }
  return response.json();
};

const genProductToken = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["genProductToken", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => genProductTokenFn(body),
    ...opts,
  });
};

export default genProductToken;
