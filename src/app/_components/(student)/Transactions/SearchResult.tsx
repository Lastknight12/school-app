import type { User } from "@prisma/client";
import TransactionDialog from "../../shared/TransactionDialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  users?: User[];
  sessionUsername: string;
  isLoading: boolean;
}

export default function SearchResult({
  users,
  sessionUsername,
  isLoading,
}: Props) {
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    // 72px - navbar, 41px - SearchInput, 3px - bottomPadding, 24px - gap between serachInput and results
    <div className="flex max-h-[calc(100vh-72px-41px-3px-24px)] flex-col gap-6 overflow-x-hidden overflow-y-scroll">
      {!users?.length ? (
        <div className="w-full text-center">Таких користувачів немає</div>
      ) : (
        users.map((user) => {
          return (
            <>
              {sessionUsername === user.name ? null : (
                <TransactionDialog
                  key={user.name}
                  user={user}
                  onMutationSuccess={() => router.refresh()}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={user.image}
                      alt="avatar"
                      className="rounded-full"
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
