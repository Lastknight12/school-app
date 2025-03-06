import { useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type { payHandler, payInput } from "~/app/api/transfers/pay/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof payHandler>>;

type Props = z.infer<typeof payInput>;

type Functions = {
  onSuccess?: (data: Res) => void;
  onError?: (data: QueryError) => void;
};

const payFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/pay", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Виникла помилка під час оплати");
  }
  return response.json();
};

const pay = ({ onSuccess, onError }: Functions) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["pay"],
    mutationFn: (body) => payFn(body),
    onSuccess,
    onError,
  });
};

export default pay;
