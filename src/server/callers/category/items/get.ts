import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import {
  type getCategoryItemsHandler,
  type getCategoryItemsInput,
} from "~/app/api/category/items/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getCategoryItemsHandler>>;

type Props = z.infer<typeof getCategoryItemsInput>;

export const getCategoryItemsFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/items", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /category/items");
  }
  return response.json();
};

const getCategoryItems = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getCategoryItems", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getCategoryItemsFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getCategoryItems;
