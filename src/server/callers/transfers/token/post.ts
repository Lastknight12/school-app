import { useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  genProductTokenHandler,
  genProductTokenInput,
} from "~/app/api/transfers/token/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof genProductTokenHandler>>;

type Props = z.infer<typeof genProductTokenInput>;

type Functions = {
  onSuccess?: (data: Res) => void;
  onError?: (data: QueryError) => void;
};

const genProductTokenFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/token", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
};

const genProductToken = ({ onSuccess, onError }: Functions) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["genProductToken"],
    mutationFn: (body) => genProductTokenFn(body),
    onSuccess,
    onError,
  });
};

export default genProductToken;
