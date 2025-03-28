import {
  type QueryKey,
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import {
  type getTransfersHandler,
  type getTransfersInput,
} from "~/app/api/transfers/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getTransfersHandler>>;
type Props = z.infer<typeof getTransfersInput>;

const getTransfersHandlerFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/transfers", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch /transfers");
  }

  return response.json();
};

const getTransfers = (
  body: Props,
  opts?: Omit<
    UseInfiniteQueryOptions<Res, QueryError>,
    "queryFn" | "initialPageParam" | "getNextPageParam" | "queryKey"
  > & { queryKey?: QueryKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useInfiniteQuery<Res, QueryError>({
    queryKey: ["getTransfersHandler", ...(opts?.queryKey ?? []), body],
    queryFn: ({ pageParam = body.cursor }) =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      getTransfersHandlerFn({ ...body, cursor: pageParam as Props["cursor"] }),
    initialPageParam: body.cursor ?? undefined,
    getNextPageParam: (data) => data.nextCursor,
    ...opts,
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      nextCursor: data.pages[data.pages.length - 1]?.nextCursor,
    }),
  });
};

export default getTransfers;
