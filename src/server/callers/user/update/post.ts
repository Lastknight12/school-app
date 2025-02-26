import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  updateUserHandler,
  updateUserInput,
} from "~/app/api/user/update/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof updateUserHandler>>;

type Props = z.infer<typeof updateUserInput>;

const updateUserFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/update", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all updateUser");
  }
  return response.json();
};

const updateUser = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["updateUser"],
    mutationFn: (body) => updateUserFn(body),
    ...opts,
  });
};

export default updateUser;
