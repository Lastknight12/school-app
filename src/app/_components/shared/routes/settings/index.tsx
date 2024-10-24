"use client";

import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useCardVariant } from "~/lib/state";
import { cn } from "~/lib/utils";

import DebitCard from "../../DebitCard";
import UploadImage from "../../UploadImage";

import { Button } from "~/shadcn/ui/button";
import { Label } from "~/shadcn/ui/label";

interface Props {
  session: Session;
  showCardDesign: boolean;
}

export default function Settings({ session, showCardDesign }: Props) {
  const [newUsername, setNewUsername] = useState(session.user.name);
  const [newImageSrc, setNewImageSrc] = useState(session.user.image);

  const currentCardVariant = useCardVariant((state) => state.variant);
  const setCardVariant = useCardVariant((state) => state.setVariant);
  
  const router = useRouter();

  function handleCardClick(variant: number) {
    setCardVariant(variant);
  }

  const updateUserMutation = api.user.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Інформацію користувача оновлено");
      router.refresh();
    },
    onError: (error) => {
      error.data?.zodError && error.data?.zodError.length > 0
        ? toast.error(error.data.zodError[0]!.message)
        : toast.error(error.message);
    },
  });

  const getUserClass = api.user.getUserClass.useQuery(void 0, {
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 px-6">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 items-center">
            {/* New name */}
            <Label className="text-left text-base">Аватарка:</Label>
            <UploadImage
              onSuccess={(imageSrc) => setNewImageSrc(imageSrc)}
              defaultImageSrc={session.user.image}
              imageSize={50}
              imageClassName=" rounded-full"
              closeButtonClassName="bg-[#4c0000] border-none text-red-700"
            />
          </div>

          <div className="grid grid-cols-2">
            {/* New name */}
            <Label className="text-left text-base">
              Ім&apos;я користувача:
            </Label>
            <input
              className="rounded-md bg-card px-3 py-1 outline-none"
              value={newUsername}
              placeholder={session.user.name}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2">
            {/* Email */}
            <Label className="text-left text-base">Email:</Label>
            <input
              className="rounded-md bg-card px-3 py-1 outline-none"
              disabled
              placeholder={session.user.email}
            />
          </div>

          <div className="grid grid-cols-2">
            {/* Klass */}
            <Label className="text-left text-base">Клас:</Label>

            {getUserClass.isFetching ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#b5b5b5]" />
            ) : getUserClass.data ? (
              <div>{getUserClass.data.name}</div>
            ) : (
              <div>Немає класу</div>
            )}
          </div>
        </div>

        <Button
          disabled={
            updateUserMutation.isPending ||
            (newUsername === session.user.name &&
              newImageSrc === session.user.image)
          }
          onClick={() =>
            updateUserMutation.mutate({
              newName: newUsername,
              newImageSrc: newImageSrc,
            })
          }
        >
          Зберегти{" "}
          {updateUserMutation.isPending && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </div>

      {showCardDesign && (
        <div className="px-6">
          <Label className="text-left text-base">Дизайн карти:</Label>

          <div className="mt-4 min-h-min overflow-x-auto">
            <div className="inline-flex space-x-4 pb-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="relative"
                  onClick={() => handleCardClick(index + 1)}
                >
                  {index + 1 === currentCardVariant && (
                    <div className="absolute -right-2 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <FaCheck className="text-blue-900" />
                    </div>
                  )}
                  <DebitCard
                    className={cn(
                      index + 1 === currentCardVariant && "opacity-50",
                    )}
                    variant={index + 1}
                    balance={session.user.balance}
                    cardHolder={session.user.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
