import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import { type payHandler, type payInput } from "~/app/api/transfers/pay/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof payHandler>>;

type Props = z.infer<typeof payInput>;

const payFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/pay", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/pay");
  }
  return response.json();
};

const pay = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["pay", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => payFn(body),
    ...opts,
  });
};

export default pay;
