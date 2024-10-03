import Image from "next/image";
import Card from "images/image.svg";
import TransfersList from "./TransfersList";
import { getServerAuthSession } from "~/server/auth";

export default async function StudentHomePage() {

  const session = await getServerAuthSession()

  return (
    <main className="mt-4 flex h-[calc(100vh-72px-16px)] flex-col justify-between">
      <div className="relative flex w-full justify-center px-3">
        {/* Card image */}
        <Image
          src={Card as string}
          alt="Card"
          width={360}
          height={267}
          priority
        />

        {/* blured bg */}
        <Image
          src={Card as string}
          alt="card bg"
          className="absolute -bottom-5 left-[calc(50%-180px)] -z-10 blur-[50px] brightness-50"
          width={360}
          height={267}
          priority
        />
      </div>

      {/* List of transactions */}
      <TransfersList session={session} />
    </main>
  );
}
