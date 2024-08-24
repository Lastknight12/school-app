import Image from "next/image";
import Card from "images/image.svg";
import { MdOutlineShoppingCart } from "react-icons/md";
import { type CSSProperties } from "react";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import type { formatedTransfer } from "~/server/api/routers/transfers";

export default async function StudentHomePage() {
  const transfers = await api.transfers.getTransfers();
  const session = await getServerAuthSession();

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
      <div className="mt-12 min-h-[350px] overflow-hidden rounded-tl-[30px] rounded-tr-[30px] border-t border-[#535353] bg-[#323232b3] pb-4">
        {/* Top line */}
        <div className="flex items-center justify-center py-5">
          <div className="h-1 w-9 rounded bg-[#ffffff1a]" />
        </div>
        {!transfers?.length && (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            No transfers
          </div>
        )}

        {/* List */}
        <div className="h-[calc(100%-60px)] overflow-y-scroll px-5">
          <div className="flex flex-col gap-5">
            {transfers.map((transfer) => {
              const formatedGradient =
                transfer.randomGradient as formatedTransfer["randomGradient"];

              const isUserSender = transfer.sender.id === session?.user.id;
              return (
                <div
                  className="flex items-center justify-between gap-5"
                  key={transfer.id}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center rounded-full bg-gradient-to-tr p-3`}
                      style={
                        {
                          "--tw-gradient-stops": `${formatedGradient.from}, ${formatedGradient.to}`,
                        } as CSSProperties
                      }
                    >
                      <MdOutlineShoppingCart fill="#232323a1" size={20} />
                    </div>

                    <div>
                      <h1 className="font-bold tracking-wide text-[#fafafa]">
                        {isUserSender
                          ? transfer.reciever.name
                          : transfer.sender.name}
                      </h1>
                      <p className="text-sm font-semibold text-[#fafafa4d]">
                        {transfer.createdAt.toLocaleDateString("uk-UA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`${isUserSender ? "text-[#FF5959]" : "text-[#53D496]"}`}
                  >
                    {isUserSender ? "-" : "+"} {transfer.amount + "$"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
