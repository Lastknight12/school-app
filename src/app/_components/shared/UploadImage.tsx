"use client";

import { env } from "~/env";
import Image from "next/image";
import { type ChangeEvent, useRef, useState } from "react";
import { MdClose, MdFileUpload } from "react-icons/md";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

interface Props {
  onSuccess?: (imageSrc: string) => void;
  defaultImageSrc?: string;
}

export default function UploadImage({ onSuccess, defaultImageSrc }: Props) {
  const [perviewSrc, setPerviewSrc] = useState(defaultImageSrc ?? "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = (await response.json()) as {
          secure_url: string;
        };

        setPerviewSrc(data.secure_url);
        onSuccess?.(data.secure_url);
      } catch (error) {
        toast("Помилка завантаження", {
          description: error as string,
        });
      }
    }
  };
  return (
    <>
      {perviewSrc ? (
        <div className="relative">
          <Image src={perviewSrc} alt="post perview" width={150} height={150} />
          <button
            className="absolute -right-1 -top-1 rounded-full border border-red-500 bg-red-100"
            onClick={() => setPerviewSrc("")}
          >
            <MdClose size={15} color="red" />
          </button>
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
