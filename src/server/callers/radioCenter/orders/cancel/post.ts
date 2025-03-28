import {
  type QueryKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  cancelOrderHandler,
  cancelOrderInput,
} from "~/app/api/radioCenter/orders/cancel/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof cancelOrderHandler>>;

type Props = z.infer<typeof cancelOrderInput>;

const cancelOrderFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/radioCenter/orders/cancel", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /radioCenter/orders/cancel");
  }
  return response.json();
};

const cancelOrder = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { queryKey?: QueryKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["cancelOrder", ...(opts?.queryKey ?? [])],
    mutationFn: (body) => cancelOrderFn(body),
    ...opts,
  });
};

export default cancelOrder;
