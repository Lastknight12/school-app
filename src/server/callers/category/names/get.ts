import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { getCategoryNamesHandler } from "~/app/api/category/names/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getCategoryNamesHandler>>;

const getCategoryNamesFn = async (): Promise<Res> => {
  const response = await fetch("/api/category/names", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /category/names");
  }
  return response.json();
};

const getCategoryNames = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getCategoryNames", ...(opts?.queryKey ?? [])],
    queryFn: () => getCategoryNamesFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getCategoryNames;
