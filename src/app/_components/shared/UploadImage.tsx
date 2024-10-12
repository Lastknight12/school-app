"use client";

import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { MdClose, MdFileUpload } from "react-icons/md";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";

interface Props {
  onSuccess?: (imageSrc: string) => void;
  defaultImageSrc?: string;
  imageSize?: number;
  imageClassName?: string;
  closeButtonClassName?: string;
  closeIconColor?: string;
}

export default function UploadImage({
  onSuccess,
  defaultImageSrc,
  imageSize,
  imageClassName,
  closeButtonClassName,
  closeIconColor,
}: Props) {
  const [perviewSrc, setPerviewSrc] = useState(defaultImageSrc ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = api.image.uploadImage.useMutation({
    onSuccess: (imageUrl) => {
      setPerviewSrc(imageUrl);
      onSuccess?.(imageUrl);
    },

    onError: (error) => {
      error.data?.zodError
        ? toast.error(error.data.zodError[0]?.message)
        : toast.error(error.message);
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate({ file: file });
    }
  };
  return (
    <>
      {perviewSrc ? (
        <div>
          <div className="relative w-max">
            <button
              className={cn(
                "absolute -right-1 -top-1 rounded-full border border-red-500 bg-red-100",
                closeButtonClassName,
              )}
              onClick={() => setPerviewSrc("")}
            >
              <MdClose
                size={15}
                className={cn(closeIconColor ?? "text-red-500")}
              />
            </button>
            <Image
              src={perviewSrc}
              alt="post perview"
              style={{ height: imageSize ?? 150 }}
              className={cn(imageClassName)}
              width={imageSize ?? 150}
              height={imageSize ?? 150}
            />
          </div>
        </div>
      ) : (
        <Button onClick={() => fileInputRef.current?.click()}>
          <MdFileUpload size={25} />
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
