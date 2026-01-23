"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

import { type getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/react";

import SearchInput from "./SearchInput";

import TransactionDialog from "~/app/_components/shared/TransactionDialog";

interface Props {
  session: Awaited<ReturnType<typeof getServerAuthSession>>;
  balance: number;
}

export default function Transactions({ session, balance }: Props) {
  const getUsers = api.user.getUsersByNameOrEmail.useMutation();

  async function onInputChange(searchTerm: string) {
    getUsers.mutate({ searchTerm });
  }

  return (
    <main className="flex flex-col gap-3 px-4">
      <SearchInput onInputChange={onInputChange} />

      <div className="flex max-h-[calc(100vh-72px-41px-3px-24px)] flex-col gap-6 overflow-x-hidden overflow-y-auto">
        {getUsers.isPending && (
          <div className="flex h-[calc(100vh-72px)] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
          </div>
        )}

        {(!getUsers.data || getUsers.data.length === 0) &&
          !getUsers.isIdle &&
          !getUsers.isPending && (
            <div className="w-full text-center h-[calc(100vh-72px)] flex items-center justify-center">
              Таких користувачів немає
            </div>
          )}

        {getUsers.data?.map((user) => {
          return (
            <>
              {session?.user.name === user.name ? null : (
                <TransactionDialog
                  key={user.name}
                  user={user}
                  balance={balance}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image ?? ""}
                      alt="avatar"
                      className="rounded-full h-[35px]"
                      width={35}
                      height={35}
                    />

                    <h1>{user.name}</h1>
                  </div>
                </TransactionDialog>
              )}
            </>
          );
        })}
      </div>
    </main>
  );
}
