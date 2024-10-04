"use client";

import { type Session } from "next-auth";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import UploadImage from "../../shared/UploadImage";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  session: Session;
}

export default function Settings({ session }: Props) {
  const [newUsername, setNewUsername] = useState(session.user.name!);
  const [newImageSrc, setNewImageSrc] = useState(session.user.image!);

  const router = useRouter();

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

  const getUserClass = api.user.getUserClass.useQuery(
    {
      id: session.user.klassId,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 items-center">
          {/* New name */}
          <Label className="text-left text-base">Аватарка:</Label>
          <UploadImage
            onSuccess={(imageSrc) => setNewImageSrc(imageSrc)}
            defaultImageSrc={session.user.image ?? undefined}
            imageSize={50}
            imageClassName=" rounded-full"
            closeButtonClassName="bg-[#4c0000] border-none text-red-700"
          />
        </div>

        <div className="grid grid-cols-2">
          {/* New name */}
          <Label className="text-left text-base">Ім&apos;я користувача:</Label>
          <input
            className="rounded-md bg-card px-3 py-1 outline-none"
            value={newUsername}
            placeholder={session.user.name!}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2">
          {/* Email */}
          <Label className="text-left text-base">Email:</Label>
          <input
            className="rounded-md bg-card px-3 py-1 outline-none"
            disabled
            placeholder={session.user.email!}
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
  );
}
