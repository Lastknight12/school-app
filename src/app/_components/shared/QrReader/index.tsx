"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import useClickOutside from "~/hooks/use-click-outside";

import "./index.css";

interface Props {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDataScanned?: (data: string) => void;
  onCloseButtonClick?: () => void;
}

export default function QrReader({
  children,
  isOpen,
  onDataScanned,
  onOpenChange,
}: Props) {
  const rootEl = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(isOpen ?? false);
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1024) {
        setOpen(false);
        setDisabled(true);
      } else {
        setDisabled(false);
        setOpen(isOpen ?? false);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  function handleClick() {
    setOpen(!open);
    onOpenChange?.(!open);
  }

  useClickOutside(rootEl, () => {
    if (open) {
      setOpen(false);
      onOpenChange?.(false);
    }
  });

  return (
    <>
      <div ref={rootEl} className="min-[1024px]:hidden flex">
        <button
          disabled={disabled}
          onClick={handleClick}
          className="min-[1024px]:hidden"
        >
          {children}
        </button>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30 w-[300px] aspect-square">
            <div
              className="absolute right-3 top-3 z-20"
              onClick={() => {
                setOpen(false);
                onOpenChange?.(false);
              }}
            >
              <X size={30} />
            </div>
            <Scanner
              components={{
                audio: false,
              }}
              onScan={(results) => {
                const firstResult = results[0]?.rawValue;
                if (firstResult) {
                  onDataScanned?.(firstResult);
                  setOpen(false);
                  onOpenChange?.(false);
                }
              }}
              onError={() => {
                toast(
                  "Камера недоступна. Перевірте налаштування камери у вашому браузері та перезавантажте сторінку.",
                );

                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
