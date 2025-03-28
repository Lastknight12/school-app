import {
  type QueryKey,
  type QueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { getAllTransactionsHandler } from "~/app/api/transfers/all/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getAllTransactionsHandler>>;

const getAllTransactionsFn = async (): Promise<Res> => {
  const response = await fetch("/api/transfers/all", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all klasses");
  }
  return response.json();
};

const getAllTransactions = (
  opts?: Omit<QueryOptions<Res, QueryError>, "queryFn"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getAllTransactions", ...(opts?.queryKey ?? [])],
    queryFn: () => getAllTransactionsFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getAllTransactions;
