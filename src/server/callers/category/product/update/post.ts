import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  updateProductHandler,
  updateProductInput,
} from "~/app/api/category/product/update/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof updateProductHandler>>;

type Props = z.infer<typeof updateProductInput>;

const updateProductFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/product/update", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /product/update");
  }
  return response.json();
};

const updateProduct = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["updateProduct"],
    mutationFn: (body) => updateProductFn(body),
    ...opts,
  });
};

export default updateProduct;
