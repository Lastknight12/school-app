import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  deleteCategoryHandler,
  deleteCategoryInput,
} from "~/app/api/category/delete/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof deleteCategoryHandler>>;

type Props = z.infer<typeof deleteCategoryInput>;

const deleteCategoryFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/delete", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /category/delete");
  }
  return response.json();
};

const deleteCategory = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["deleteCategory", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => deleteCategoryFn(body),
    ...opts,
  });
};

export default deleteCategory;
