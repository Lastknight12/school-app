import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  deleteOrderHandler,
  deleteOrderInput,
} from "~/app/api/radioCenter/orders/delete/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof deleteOrderHandler>>;

type Props = z.infer<typeof deleteOrderInput>;

const deleteOrderFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/radioCenter/orders/delete", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /radioCenter/orders/delete");
  }
  return response.json();
};

const deleteOrder = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["deleteOrder", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => deleteOrderFn(body),
    ...opts,
  });
};

export default deleteOrder;
