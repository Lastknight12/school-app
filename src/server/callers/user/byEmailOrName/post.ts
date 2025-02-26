import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import {
  type getUsersByNameOrEmailHandler,
  type getUsersByNameOrEmailInput,
} from "~/app/api/user/byEmailOrName/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getUsersByNameOrEmailHandler>>;

type Props = z.infer<typeof getUsersByNameOrEmailInput>;

const getUsersByNameOrEmailFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/byEmailOrName", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /user/byEmailOrName");
  }
  return response.json();
};

const getUsersByNameOrEmail = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["getUsersByNameOrEmail"],
    mutationFn: (body) => getUsersByNameOrEmailFn(body),
    ...opts,
  });
};

export default getUsersByNameOrEmail;
