"use client";

import type { Session } from "next-auth";

import { api } from "~/trpc/react";

import SearchInput from "./SearchInput";
import SearchResult from "./SearchResult";

interface Props {
  session: Session;
}

export default function Transactions({ session }: Props) {
  const getUsers = api.user.getUsersByNameOrEmail.useMutation();

  async function onInputChange(searchTerm: string) {
    getUsers.mutate({ searchTerm });
  }

  return (
    <main className="flex flex-col gap-3 px-4">
      <SearchInput onInputChange={onInputChange} />

      <SearchResult
        users={getUsers.data ?? []}
        session={session}
        isLoading={getUsers.isPending}
      />
    </main>
  );
}
