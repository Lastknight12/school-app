import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { getMusicOrdersHandler } from "~/app/api/radioCenter/orders/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getMusicOrdersHandler>>;

const getMusicOrdersFn = async (): Promise<Res> => {
  const response = await fetch("/api/radioCenter/orders", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /orders");
  }
  return response.json();
};

const getMusicOrders = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getMusicOrders"],
    queryFn: () => getMusicOrdersFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getMusicOrders;
