import TransfersList from "./TransfersList";
import { getServerAuthSession } from "~/server/auth";
import DebitCard from "../../shared/DebitCard";

export default async function StudentHomePage() {
  const session = await getServerAuthSession();

  return (
    <main className="mt-4 flex h-[calc(100vh-72px-16px)] flex-col justify-between">
      <div className="relative flex w-full justify-center">
      </div>

      {/* List of transactions */}
      <TransfersList session={session} />
    </main>
  );
}
