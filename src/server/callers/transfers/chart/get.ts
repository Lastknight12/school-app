import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { getChartDataHandler } from "~/app/api/transfers/chart/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getChartDataHandler>>;

export const getChartDataFn = async (): Promise<Res> => {
  const response = await fetch("/api/transfers/chart", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/chart");
  }
  return response.json();
};

const getChartData = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getChartData", ...(opts?.queryKey ?? [])],
    queryFn: () => getChartDataFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getChartData;
