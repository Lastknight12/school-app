import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import {
  type sendMoneyHandler,
  type sendMoneyInput,
} from "~/app/api/transfers/sendMoney/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof sendMoneyHandler>>;

type Props = z.infer<typeof sendMoneyInput>;

const sendMoneyFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/sendMoney", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/sendMoney");
  }
  return response.json();
};

const sendMoney = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["sendMoney", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => sendMoneyFn(body),
    ...opts,
  });
};

export default sendMoney;
