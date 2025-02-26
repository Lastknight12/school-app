import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  deleteUserHandler,
  deleteUserInput,
} from "~/app/api/user/delete/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof deleteUserHandler>>;

type Props = z.infer<typeof deleteUserInput>;

const deleteUserFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/delete", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /user/delete");
  }
  return response.json();
};

const deleteUser = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["deleteUser"],
    mutationFn: (body) => deleteUserFn(body),
    ...opts,
  });
};

export default deleteUser;
