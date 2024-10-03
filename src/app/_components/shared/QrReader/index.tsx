"use client";

import { useEffect, useRef, useState } from "react";

// Styles
import "./index.css";
import Image from "next/image";

// Qr Scanner
import QrScanner from "qr-scanner";
import QrFrame from "images/qr-frame.svg";

import useClickOutside from "~/hooks/useClickOutside";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDataScanned?: (data: string) => void;
}

/**
 * QrReader component
 *
 * @param {React.ReactNode} children - React Node to show open or close scanner
 * @param {boolean} isOpen - Custom state for scanner
 * @param {(data: string) => void} onDataScanned - Callback when qr code is scanned
 * @param {(open: boolean) => void} handleOpenChange - Callback when scanner is opened or closed
 *
 * @example
 * <QrReader isOpen={isOpen} onDataScanned={onDataScanned} handleOpenChange={handleOpenChange}>
 *   <Button>Open scanner</Button>
 * </QrReader>
 */

export default function QrReader({
  children,
  isOpen,
  onDataScanned,
  onOpenChange,
}: Props) {
  // QR States
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const rootEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(isOpen ?? false);

  function handleClick() {
    setOpen(!open);
    onOpenChange?.(!open);
  }

  // close scanner when user clicks outside
  useClickOutside(rootEl, () => {
    if (open) {
      setOpen(false);
      onOpenChange?.(false);
    }
  });
  // Success
  const onScanSuccess = (result: QrScanner.ScanResult) => {
    onDataScanned?.(result.data);
    scanner.current?.stop();
  };

  // Fail
  const onScanFail = (err: string | Error) => {
    // 🖨 Print the "err" to browser console.
    console.log(err)
  };

  useEffect(() => {
    if (videoEl?.current && !scanner.current) {
      // 👉 Instantiate the QR Scanner
      scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
        onDecodeError: onScanFail,
        // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
        preferredCamera: "environment",
        // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
        // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
        highlightCodeOutline: true,
        // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
        overlay: qrBoxEl?.current ?? undefined,
      });
    }

    if (isOpen ?? open) {
      scanner?.current
        ?.start()
        .then(() => setQrOn(true))
        .catch((err) => {
          if (err) setQrOn(false);
        });
    } else {
      // stop scanning
      scanner?.current?.stop();
      // reset scanner on close (if dont do it the scanner will keep running and dont display video on screen)
      scanner.current = undefined;
    }

    // 🧹 Clean up on unmount.
    // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!videoEl?.current) {
        scanner?.current?.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen ?? open]);

  // ❌ If "camera" is not allowed in browser permissions, show an alert.
  useEffect(() => {
    if (!qrOn)
      toast(
        "Камера недоступна. Перевірте налаштування камери у вашому браузері та перезавантажте сторінку.",
      );
  }, [qrOn]);

  return (
    <div ref={rootEl}>
      {/* Button to open scanner */}
      <button onClick={handleClick}>{children}</button>

      {qrOn && (isOpen ?? open) && (
        // disable on desktop
        <div className="absolute left-0 top-1/2 -translate-y-1/2 min-[600px]:hidden z-10">
          <video ref={videoEl} />
          <div ref={qrBoxEl} className="relative">
            <Image
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              src={QrFrame}
              alt="QR Frame"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              width={150}
              height={150}
            />
          </div>
        </div>
      )}
    </div>
  );
}
