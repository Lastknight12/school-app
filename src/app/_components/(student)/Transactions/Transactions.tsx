"use client";

import SearchResult from "./SearchResult";
import SearchInput from "./SearchInput";
import { api } from "~/trpc/react";
import type { Session } from "next-auth";

interface Props {
  session: Session;
}

export default function Transactions({ session }: Props) {
  const getUsersByName = api.user.getUsersByName.useMutation();

  async function onInputChange(name: string) {
    getUsersByName.mutate({ name });
  }

  return (
    <main className="flex flex-col gap-3 px-4">
      <SearchInput onInputChange={onInputChange} />

      <SearchResult
        users={getUsersByName.data ?? []}
        sessionUsername={session.user.name!}
        isLoading={getUsersByName.isPending}
      />
    </main>
  );
}
