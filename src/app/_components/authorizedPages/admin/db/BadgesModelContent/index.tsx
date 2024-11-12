"use client";

import { api } from "~/trpc/react";

import AddBadgeModal from "./AddBadgeModal";

import Badge from "~/shadcn/ui/badge";
import { Loader2 } from "lucide-react";

export default function BadgesModelContent() {
  const { data: badges, isFetching: isFetchingBadges } =
    api.user.getAllBadges.useQuery();

  return (
    <div>
      <div className="mb-4">
        <AddBadgeModal />
      </div>

      <h1 className="text-xl mb-3">Badges:</h1>
      <div>
        {isFetchingBadges && (
          <div className="mb-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
          </div>
        )}

        {badges?.length === 0 && <li>No badges found</li>}

        <div className="flex items-center gap-3 flex-wrap">
          {badges?.map((badge) => (
            <Badge
              name={badge.name}
              textColor={badge.textColor}
              background={badge.backgroundColor}
              key={badge.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
