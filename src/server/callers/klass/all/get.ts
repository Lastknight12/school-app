import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { type getAllKlassesHandler } from "~/app/api/klass/all/route";

import { type QueryError } from "~/lib/server";

type Res = Awaited<ReturnType<typeof getAllKlassesHandler>>;

const getAllKlassesFn = async (): Promise<Res> => {
  const response = await fetch("/api/klass/all", {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch /klass/all");
  }
  return response.json();
};

const getAllKlasses = (
  opts?: Omit<UseQueryOptions<Res, QueryError>, "queryFn" | "queryKey">,
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useQuery<Res, QueryError>({
    queryKey: ["getAllKlasses"],
    queryFn: () => getAllKlassesFn(),
    refetchOnWindowFocus: false,
    ...opts,
  });
};

export default getAllKlasses;
