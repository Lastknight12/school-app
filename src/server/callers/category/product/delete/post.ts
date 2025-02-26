import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import type {
  deleteProductHandler,
  deleteProductInput,
} from "~/app/api/category/product/delete/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof deleteProductHandler>>;

type Props = z.infer<typeof deleteProductInput>;

const deleteProductFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/category/product/delete", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /category/product/delete");
  }
  return response.json();
};

const deleteProduct = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  >,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: opts?.mutationKey ?? ["deleteProduct"],
    mutationFn: (body) => deleteProductFn(body),
    ...opts,
  });
};

export default deleteProduct;
