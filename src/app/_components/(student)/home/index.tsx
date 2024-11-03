import { type Session } from "next-auth";

import DebitCard from "../../shared/DebitCard";
import TransfersList from "./TransfersList";

interface Props {
  session: Session;
}

export default async function StudentHomePage({ session }: Props) {
  return (
    <main className="flex h-full_page flex-col justify-between">
      <div className="relative flex w-full justify-center">
        <DebitCard
          balance={session.user.balance}
          cardHolder={session.user.name ?? "Ім'я"}
          className="max-[410px]:!w-[280px]"
        />

        {/* blured bg */}
        <DebitCard
          balance={session.user.balance}
          cardHolder={session.user.name ?? "Ім'я"}
          className="absolute left-1/2 -translate-x-1/2 blur-2xl max-[410px]:!w-[280px]"
        />
      </div>

      {/* List of transactions */}
      <TransfersList session={session} />
    </main>
  );
}
