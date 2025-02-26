import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type getStatsHandler } from "~/app/api/transfers/stats/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getStatsHandler>>;

export const getStatsFn = async (): Promise<Res> => {
  const response = await fetch("/api/transfers/stats", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/stats");
  }
  return response.json();
};

const getStats = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getStats"],
    queryFn: () => getStatsFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getStats;
