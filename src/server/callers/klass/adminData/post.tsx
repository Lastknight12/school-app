import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import {
  getAdminDataHandler,
  getAdminDataInput,
} from "~/app/api/klass/adminData/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getAdminDataHandler>>;

type Props = z.infer<typeof getAdminDataInput>;

export const getAdminDataFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/adminData", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /klass/adminData");
  }
  return response.json();
};

const getAdminData = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getAdminData", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getAdminDataFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getAdminData;
