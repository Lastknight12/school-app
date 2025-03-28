import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { type z } from "zod";
import {
  type getAdminDataHandler,
  type getAdminDataInput,
} from "~/app/api/klass/adminData/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getAdminDataHandler>>;

type Props = z.infer<typeof getAdminDataInput>;

const getAdminDataFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/adminData", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /klass/adminData");
  }
  return response.json();
};

const getAdminData = (
  opts?: Omit<UseMutationOptions<Res, QueryError, Props>, "mutationFn">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["getAdminData", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => getAdminDataFn(body),
    ...opts,
  });
};

export default getAdminData;
