import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type getReplenishHandler } from "~/app/api/kazna/replenish/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getReplenishHandler>>;

const getKaznaReplenishFn = async (): Promise<Res> => {
  const response = await fetch("/api/kazna/replenish", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /kazna/replenish");
  }
  return response.json();
};

const getKaznaReplenish = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getKaznaReplenish"],
    queryFn: () => getKaznaReplenishFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getKaznaReplenish;
