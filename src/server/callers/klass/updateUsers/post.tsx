import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  updateUsersHandler,
  updateUsersInput,
} from "~/app/api/klass/updateUsers/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof updateUsersHandler>>;

type Props = z.infer<typeof updateUsersInput>;

const updateUsersFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/updateUsers", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /klass/updateUsers");
  }
  return response.json();
};

const updateUsers = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["updateUsers", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => updateUsersFn(body),
    ...opts,
  });
};

export default updateUsers;
