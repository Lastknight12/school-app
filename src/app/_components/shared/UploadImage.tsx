"use client";

import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { MdClose, MdFileUpload } from "react-icons/md";
import { toast } from "sonner";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";
import { useMutation } from "@tanstack/react-query";
import { type uploadImageRes } from "~/app/api/uploadImage/route";

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

  const uploadFile = (file: File): Promise<uploadImageRes> => {
    const formData = new FormData();
    formData.append("file", file);

    return fetch("/api/uploadImage", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  };

  const uploadFileMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: ({ imageUrl, error }) => {
      if (error) {
        toast.error(error);
        return;
      }

      setPerviewSrc(imageUrl);
      onSuccess?.(imageUrl);
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      uploadFileMutation.mutate(file);
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
                closeButtonClassName
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
