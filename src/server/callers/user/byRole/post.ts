/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import type {
  getUsersByRoleHandler,
  getUsersByRoleInput,
} from "~/app/api/user/byRole/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getUsersByRoleHandler>>;

type Props = z.infer<typeof getUsersByRoleInput>;

export const getUsersByRoleFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/byRole", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /user/byRole");
  }
  return response.json();
};

const getUsersByRole = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getUsersByRole", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getUsersByRoleFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getUsersByRole;
