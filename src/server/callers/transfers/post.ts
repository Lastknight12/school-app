import {
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  getTransfersHandler,
  getTransfersInput,
} from "~/app/api/transfers/route";

import { type QueryError } from "~/lib/server";

type Props = z.infer<typeof getTransfersInput>;

type Res = Awaited<ReturnType<typeof getTransfersHandler>>;

export const getTransfersFn = async (body: Props): Promise<Res> => {
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
    "queryFn" | "queryKey" | "initialPageParam" | "getNextPageParam"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useInfiniteQuery<Res, QueryError>({
    queryKey: ["getTransfers", body],
    queryFn: ({ pageParam = body.cursor }) =>
      getTransfersFn({ ...body, cursor: pageParam as Props["cursor"] }),
    initialPageParam: body.cursor,
    getNextPageParam: (data) => data.nextCursor,
    ...opts,
    select: (data) => {
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        nextCursor: data.pages[data.pages.length - 1]?.nextCursor,
      };
    },
  });
};

export default getTransfers;
