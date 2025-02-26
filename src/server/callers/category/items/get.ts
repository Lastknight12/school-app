import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
  type getCategoryItemsHandler,
  type getCategoryItemsInput,
} from "~/app/api/category/items/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getCategoryItemsHandler>>;

type Props = z.infer<typeof getCategoryItemsInput>;

const getCategoryItemsFn = async (body: Props): Promise<Res> => {
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
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getCategoryItems", body],
    queryFn: () => getCategoryItemsFn(body),
    ...opts,
  });
};

export default getCategoryItems;
