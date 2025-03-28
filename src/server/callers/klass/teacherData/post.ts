import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import type {
  getTeacherDataHandler,
  getTeacherDataInput,
} from "~/app/api/klass/teacherData/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getTeacherDataHandler>>;

type Props = z.infer<typeof getTeacherDataInput>;

const getTeacherDataFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/teacherData", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /klass/teacherData");
  }
  return response.json();
};

const getTeacherData = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getTeacherData", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getTeacherDataFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getTeacherData;
