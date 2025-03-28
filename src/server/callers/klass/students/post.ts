import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";
import type { z } from "zod";
import type {
  getKlassStudentsHandler,
  getKlassStudentsInput,
} from "~/app/api/klass/students/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getKlassStudentsHandler>>;

type Props = z.infer<typeof getKlassStudentsInput>;

const getKlassStudentsFn = async (body: Props): Promise<Res> => {
  const response = await fetch("/api/klass/students", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /klass/students");
  }
  return response.json();
};

const getKlassStudents = (
  body: Props,
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey"> & {
    queryKey?: QueryKey;
  },
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getKlassStudents", body, ...(opts?.queryKey ?? [])],
    queryFn: () => getKlassStudentsFn(body),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getKlassStudents;
