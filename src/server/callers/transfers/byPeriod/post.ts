import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
  type getTransfersByPeriodHandler,
  type getTransfersByPeriodInput,
} from "~/app/api/transfers/byPeriod/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getTransfersByPeriodHandler>>;

type Props = z.infer<typeof getTransfersByPeriodInput>;

export const getTransfersByPeriodFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers/byPeriod", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /transfers/byPeriod");
  }
  return response.json();
};

const getTransfersByPeriod = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getTransfersByPeriod", body],
    queryFn: () => getTransfersByPeriodFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getTransfersByPeriod;
