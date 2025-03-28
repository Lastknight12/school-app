import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type { addKlassHandler, addKlassInput } from "~/app/api/klass/add/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof addKlassHandler>>;

type Props = z.infer<typeof addKlassInput>;

const addKlassFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/add", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /klass/add");
  }
  return response.json();
};

const addKlass = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["addKlass", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => addKlassFn(body),
    ...opts,
  });
};

export default addKlass;
