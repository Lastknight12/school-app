import { useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  sendMoneyHandler,
  sendMoneyInput,
} from "~/app/api/transfers/sendMoney/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof sendMoneyHandler>>;

type Props = z.infer<typeof sendMoneyInput>;

type Functions = {
  onSuccess?: (data: Res) => void;
  onError?: (data: QueryError) => void;
};

const sendMoneyFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/sendMoney", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
};

const sendMoney = ({ onSuccess, onError }: Functions) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["sendMoney"],
    mutationFn: (body) => sendMoneyFn(body),
    onSuccess,
    onError,
  });
};

export default sendMoney;
