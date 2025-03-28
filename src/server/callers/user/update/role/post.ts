import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  updateUserRoleHandler,
  updateUserRoleInput,
} from "~/app/api/user/update/role/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof updateUserRoleHandler>>;

type Props = z.infer<typeof updateUserRoleInput>;

const updateUserRoleFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/update/role", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all updateUserRole");
  }
  return response.json();
};

const updateUserRole = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["updateUserRole", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => updateUserRoleFn(body),
    ...opts,
  });
};

export default updateUserRole;
