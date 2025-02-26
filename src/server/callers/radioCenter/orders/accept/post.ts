import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  acceptOrderHandler,
  acceptOrderInput,
} from "~/app/api/radioCenter/orders/accept/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof acceptOrderHandler>>;

type Props = z.infer<typeof acceptOrderInput>;

const acceptOrderFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/radioCenter/orders/accept", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /radioCenter/orders/accept");
  }
  return response.json();
};

const acceptOrder = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["acceptOrder"],
    mutationFn: (body) => acceptOrderFn(body),
    ...opts,
  });
};

export default acceptOrder;
