"use client";

import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import React from "react";
import SuperJSON from "superjson";

export function ReactQueryProvider(props: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          dehydrate: {
            serializeData: SuperJSON.serialize,
            shouldDehydrateQuery: (query) =>
              defaultShouldDehydrateQuery(query) ||
              query.state.status === "pending",
          },
          hydrate: {
            deserializeData: SuperJSON.deserialize,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
