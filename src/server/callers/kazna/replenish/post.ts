import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  replenishHandler,
  replenishInput,
} from "~/app/api/kazna/replenish/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof replenishHandler>>;

type Props = z.infer<typeof replenishInput>;

const replenishKaznaFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/kazna/replenish", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /kazna/replenish");
  }
  return response.json();
};

const replenishKazna = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["replenishKazna", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => replenishKaznaFn(body),
    ...opts,
  });
};

export default replenishKazna;
