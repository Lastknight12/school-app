import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type getTransfersHandler } from "~/app/api/transfers/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getTransfersHandler>>;

export const getTransfersFn = async (): Promise<Res> => {
  const response = await fetch("/api/transfers", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers");
  }
  return response.json();
};

const getTransfers = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getTransfers"],
    queryFn: () => getTransfersFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getTransfers;
