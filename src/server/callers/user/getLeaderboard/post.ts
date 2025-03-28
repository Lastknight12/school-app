import {
  type QueryKey,
  type UseInfiniteQueryOptions,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { type z } from "zod";
import {
  type getLeaderboardHandler,
  type getLeaderboardInput,
} from "~/app/api/user/getLeaderboard/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getLeaderboardHandler>>;
type Props = z.infer<typeof getLeaderboardInput>;

const getLeaderboardFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/user/getLeaderboard", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user/getLeaderboard");
  }

  return response.json();
};

const getLeaderboard = (
  body: Props,
  opts?: Omit<
    UseInfiniteQueryOptions<Res, QueryError>,
    "queryFn" | "queryKey" | "initialPageParam" | "getNextPageParam"
  > & { queryKey?: QueryKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useInfiniteQuery<Res, QueryError>({
    queryKey: ["getLeaderboard", body],
    queryFn: ({ pageParam = body.cursor }) =>
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      getLeaderboardFn({ ...body, cursor: pageParam as Props["cursor"] }),
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

export default getLeaderboard;
