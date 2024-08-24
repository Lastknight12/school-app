"use client";

import { api } from "~/trpc/react";
import Spinner from "~/components/ui/spinner";
import Link from "next/link";
import ButtonsGroup from "../_components/(admin)/home/ButtonsGroup";

export default function KlassesTable() {
  const klassNames = api.klass.getAllKlasses.useQuery(void 0, {
    refetchOnWindowFocus: false,
  });

  return (
    <div className="mx-5 mb-3">
      <ButtonsGroup />
      {klassNames.data?.length === 0 && !klassNames.isFetching && (
        <div className="w-full text-center">Жодних класів не знайдено</div>
      )}
      <div className="flex w-full flex-col gap-2">
        {klassNames.isFetching ? (
          <div className="flex w-full justify-center">
            <Spinner />
          </div>
        ) : (
          klassNames.data?.map((klass) => {
            return (
              <Link
                key={klass.name}
                href={`/admin/klass/${klass.name}`}
                className="flex w-full cursor-pointer justify-center rounded-md bg-card py-6 text-lg"
              >
                {klass.name}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
