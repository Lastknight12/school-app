import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { getCurrentQueueHandler } from "~/app/api/radioCenter/currentQueue/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getCurrentQueueHandler>>;

const getCurrentQueueFn = async (): Promise<Res> => {
  const response = await fetch("/api/radioCenter/currentQueue", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /radioCenter/currentQueue");
  }
  return response.json();
};

const getCurrentQueue = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getCurrentQueue"],
    queryFn: () => getCurrentQueueFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getCurrentQueue;
