import { type Session } from "next-auth";

import DebitCard from "../../shared/DebitCard";
import TransfersList from "./TransfersList";

interface Props {
  session: Session;
}

export default async function StudentHomePage({ session }: Props) {
  return (
    <main className="flex h-full_page flex-col justify-between">
      <div className="relative flex w-full justify-center px-6">
        <DebitCard
          balance={session.user.balance}
          cardHolder={session.user.name ?? "Ім'я"}
          className="max-[353px]:!w-[300px]"
        />

        {/* blured bg */}
        <DebitCard
          balance={session.user.balance}
          cardHolder={session.user.name ?? "Ім'я"}
          className="fixed left-1/2 -translate-x-1/2 blur-2xl max-[353px]:!w-[300px]"
        />
      </div>

      {/* List of transactions */}
      <TransfersList session={session} />
    </main>
  );
}
