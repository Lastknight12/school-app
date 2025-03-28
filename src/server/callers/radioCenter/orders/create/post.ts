import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import {
  type createOrderHandler,
  type createOrderInput,
} from "~/app/api/radioCenter/orders/create/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof createOrderHandler>>;

type Props = z.infer<typeof createOrderInput>;

const createOrderFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/radioCenter/orders/create", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /radioCenter/orders/create");
  }
  return response.json();
};

const createOrder = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["createOrder", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => createOrderFn(body),
    ...opts,
  });
};

export default createOrder;
