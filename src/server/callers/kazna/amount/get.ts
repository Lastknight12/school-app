import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import { type getKaznaAmountHandler } from "~/app/api/kazna/amount/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getKaznaAmountHandler>>;

export const getKaznaAmountFn = async (): Promise<Res> => {
  const response = await fetch("/api/kazna/amount", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /kazna/amount");
  }
  return response.json();
};

const getKaznaAmount = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getKaznaAmount", ...(opts?.queryKey ?? [])],
    queryFn: () => getKaznaAmountFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getKaznaAmount;
