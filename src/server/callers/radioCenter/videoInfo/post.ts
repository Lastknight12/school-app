import {
  type MutationKey,
  type UseMutationOptions,
  useMutation,
} from "@tanstack/react-query";
import { type z } from "zod";
import type {
  getVideoInfoHandler,
  getVideoInfoInput,
} from "~/app/api/radioCenter/videoInfo/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getVideoInfoHandler>>;

type Props = z.infer<typeof getVideoInfoInput>;

const getVideoInfoFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/radioCenter/videoInfo", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch all /radioCenter/videoInfo");
  }
  return response.json();
};

const getVideoInfo = (
  opts?: Omit<
    UseMutationOptions<Res, QueryError, Props>,
    "mutationFn" | "mutationkey"
  > & { mutationKey?: MutationKey },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMutation<Res, QueryError, Props>({
    mutationKey: ["getVideoInfo", ...(opts?.mutationKey ?? [])],
    mutationFn: (body) => getVideoInfoFn(body),
    ...opts,
  });
};

export default getVideoInfo;
