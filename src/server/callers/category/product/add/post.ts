import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import {
  type addProductHandler,
  type addProductInput,
} from "~/app/api/category/product/add/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof addProductHandler>>;

type Props = z.infer<typeof addProductInput>;

const addProductFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/product/add", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /product/add");
  }
  return response.json();
};

const addProduct = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationKey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["addProduct", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => addProductFn(body),
    ...opts,
  });
};

export default addProduct;
