import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import type {
  getItemsFromTokenHandler,
  getItemsFromTokenInput,
} from "~/app/api/category/items/fromToken/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getItemsFromTokenHandler>>;

type Props = z.infer<typeof getItemsFromTokenInput>;

const getItemsFromTokenFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/items/fromToken", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /category/items/fromToken");
  }
  return response.json();
};

const getItemsFromToken = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getItemsFromToken", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getItemsFromTokenFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getItemsFromToken;
