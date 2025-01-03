"use client";

import { type Badge as BadgeModel } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useCardVariant } from "~/lib/state";
import { cn } from "~/lib/utils";

import DebitCard from "../../shared/DebitCard";
import UploadImage from "../../shared/UploadImage";

import Badge from "~/shadcn/ui/badge";
import { Button } from "~/shadcn/ui/button";
import { Input } from "~/shadcn/ui/input";
import { Label } from "~/shadcn/ui/label";
import { useSidebar } from "~/shadcn/ui/sidebar";

interface Props {
  session: Session;
  showCardDesign: boolean;
}

export default function Settings({
  session: defaultSession,
  showCardDesign,
}: Props) {
  const [newUsername, setNewUsername] = useState(defaultSession.user.name);
  const [newImageSrc, setNewImageSrc] = useState(defaultSession.user.image);
  const [activeBadge, setActiveBadge] = useState<BadgeModel | null>(
    defaultSession.user.activeBadge,
  );

  const { open, isMobile } = useSidebar();

  const updateActivebadgeMutation = api.user.setActiveBadge.useMutation({
    onError: () => {
      setActiveBadge(defaultSession.user.activeBadge);
      toast.error("Помилка при оновленні активного бейджу");
    },
  });

  const { update, data: newSession } = useSession();
  const isValuesChanged =
    newUsername !== (newSession?.user.name ?? defaultSession.user.name) ||
    newImageSrc !== (newSession?.user.image ?? defaultSession.user.image);

  const currentCardVariant = useCardVariant((state) => state.variant);
  const setCardVariant = useCardVariant((state) => state.setVariant);

  const router = useRouter();

  function handleCardClick(variant: number) {
    setCardVariant(variant);
  }

  const updateUserMutation = api.user.updateUser.useMutation({
    onSuccess: async () => {
      await update({ newUsername, newImageSrc });
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
      <div className="mb-5 flex flex-col gap-3 px-6 pb-5">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            {/* New name */}
            <Label className="text-left text-base">Аватарка:</Label>
            <UploadImage
              onSuccess={(imageSrc) => setNewImageSrc(imageSrc)}
              defaultImageSrc={defaultSession.user.image}
              imageSize={50}
              imageClassName=" rounded-full"
              closeButtonClassName="bg-red-700 border-none text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            {/* New name */}
            <Label className="text-left text-base">
              Ім&apos;я користувача:
            </Label>
            <Input
              value={newUsername}
              placeholder={defaultSession.user.name}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {/* Email */}
            <Label className="text-left text-base">Email:</Label>
            <Input disabled placeholder={defaultSession.user.email} />
          </div>

          <div className="flex gap-3">
            {/* Klass */}
            <Label className="text-left text-base">Клас:</Label>

            {getUserClass.isFetching ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#b5b5b5]" />
            ) : getUserClass.data ? (
              <div>{getUserClass.data.name}</div>
            ) : (
              <div className="text-red-500">Немає класу</div>
            )}
          </div>

          <div className="flex gap-3">
            {/* Klass */}
            <Label className="text-left text-base"> Бейджі:</Label>

            <div className="flex items-center gap-2 flex-wrap">
              {defaultSession.user.badges.map((badge) => (
                <div key={badge.id} className="relative">
                  <Badge
                    className={cn(activeBadge?.id === badge.id && "opacity-50")}
                    name={badge.name}
                    textColor={badge.textColor}
                    background={badge.backgroundColor}
                    onClick={() => {
                      if (activeBadge?.id === badge.id) {
                        setActiveBadge(null);
                      } else {
                        setActiveBadge(badge);
                        updateActivebadgeMutation.mutate({
                          badgeName: badge.name,
                        });
                      }
                    }}
                  />

                  {activeBadge?.id === badge.id && (
                    <div className="absolute -right-1 top-0 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500">
                      <FaCheck className="text-blue-900" size={7} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={() =>
            updateUserMutation.mutate({
              newName: newUsername,
              newImageSrc: newImageSrc,
            })
          }
          className="items-center mt-3"
          disabled={!isValuesChanged || updateUserMutation.isPending}
        >
          <h1 className="text-base">Зберегти зміни</h1>
          {updateUserMutation.isPending && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </div>

      {showCardDesign && (
        <div
          className={cn(
            "px-6 transition-all duration-200 ease-linear",
            open && !isMobile && "!w-[calc(100vw-16rem)]",
            isMobile ? "w-screen" : "w-[calc(100vw-24px*2)]",
          )}
        >
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
                    balance={defaultSession.user.balance}
                    cardHolder={defaultSession.user.name}
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
