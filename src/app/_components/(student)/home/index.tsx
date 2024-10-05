import TransfersList from "./TransfersList";
import { getServerAuthSession } from "~/server/auth";
import DebitCard from "../../shared/DebitCard";

export default async function StudentHomePage() {
  const session = await getServerAuthSession();

  return (
    <main className="mt-4 flex h-[calc(100vh-72px-16px)] flex-col justify-between">
      <div className="relative flex w-full justify-center">
        <DebitCard
          balance={session!.user.balance}
          cardHolder={session!.user.name!}
          className="max-[353px]:!w-[300px]"
        />

        {/* blured bg */}
        <DebitCard
          balance={session!.user.balance}
          cardHolder={session!.user.name!}
          className="fixed left-1/2 -translate-x-1/2 blur-2xl max-[353px]:!w-[300px]"
        />
      </div>

      {/* List of transactions */}
      <TransfersList session={session} />
    </main>
  );
}
