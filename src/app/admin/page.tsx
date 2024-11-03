"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";

import { api } from "~/trpc/react";

import AddClass from "../_components/(admin)/home/AddClass";

export default function KlassesTable() {
  const klassNames = api.klass.getAllKlasses.useQuery(void 0, {
    refetchOnWindowFocus: false,
  });

  return (
    <div className="px-6">
      {klassNames.isFetching ? (
        <div className="flex h-[calc(100vh-72px)] items-center w-full justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
        </div>
      ) : (
        <>
          <div className="flex w-full justify-end items-center">
            <AddClass />
          </div>

          {klassNames.data?.length === 0 && !klassNames.isFetching && (
            <div className="w-full text-center">Жодних класів не знайдено</div>
          )}

          <div className="flex w-full flex-col gap-2">
            {klassNames.data?.map((klass) => {
              return (
                <Link
                  key={klass.name}
                  href={`/admin/klass/${klass.name}`}
                  className="flex w-full cursor-pointer justify-center rounded-md bg-card border border-border py-6 text-lg"
                >
                  {klass.name}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
