import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type getUserClassHandler } from "~/app/api/user/class/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getUserClassHandler>>;

const getUserClassFn = async (): Promise<Res> => {
  const response = await fetch("/api/user/class", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch getUserClass");
  }
  return response.json();
};

const getUserClass = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getUserClass"],
    queryFn: () => getUserClassFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getUserClass;
