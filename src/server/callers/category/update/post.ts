import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  updateCategoryHandler,
  updateCategoryInput,
} from "~/app/api/category/update/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof updateCategoryHandler>>;

type Props = z.infer<typeof updateCategoryInput>;

const updateCategoryFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/update", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /category/update");
  }
  return response.json();
};

const updateCategory = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["updateCategory"],
    mutationFn: (body) => updateCategoryFn(body),
    ...opts,
  });
};

export default updateCategory;
