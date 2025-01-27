import type { User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

import TransactionDialog from "../../shared/TransactionDialog";

interface Props {
  users: User[];
  session: Session;
  isLoading: boolean;
}

export default function SearchResult({ users, session, isLoading }: Props) {
  const router = useRouter();

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5] mx-auto" />;
  }

  function onMutationSuccess() {
    router.refresh();
  }

  return (
    // 72px - navbar, 41px - SearchInput, 3px - bottomPadding, 24px - gap between serachInput and results
    <div className="flex max-h-[calc(100vh-72px-41px-3px-24px)] flex-col gap-6 overflow-x-hidden overflow-y-auto">
      {users.length === 0 ? (
        <div className="w-full text-center">Таких користувачів немає</div>
      ) : (
        users.map((user) => {
          return (
            <>
              {session.user.name === user.name ? null : (
                <TransactionDialog
                  key={user.name}
                  user={user}
                  onMutationSuccess={onMutationSuccess}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image}
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
        })
      )}
    </div>
  );
}
