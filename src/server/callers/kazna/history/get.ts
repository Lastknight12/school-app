import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { type getHistoryHandler } from "~/app/api/kazna/history/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getHistoryHandler>>;

const getKaznaHistoryFn = async (): Promise<Res> => {
  const response = await fetch("/api/kazna/history", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /kazna/history");
  }
  return response.json();
};

const getKaznaHistory = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getKaznaHistory", ...(opts?.queryKey ?? [])],
    queryFn: () => getKaznaHistoryFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getKaznaHistory;
