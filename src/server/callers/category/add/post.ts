import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  addCategoryHandler,
  addCategoryInput,
} from "~/app/api/category/add/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof addCategoryHandler>>;

type Props = z.infer<typeof addCategoryInput>;

const addCategoryFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/add", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /category/add");
  }
  return response.json();
};

const addCategory = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["addCategory"],
    mutationFn: (body) => addCategoryFn(body),
    ...opts,
  });
};

export default addCategory;
