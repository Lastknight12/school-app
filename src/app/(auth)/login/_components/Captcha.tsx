"use client";

import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";
import { env } from "~/env";

interface Props {
  onSuccess: () => void;
}

export default function Captcha({ onSuccess }: Props) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  async function handleCaptchaSubmission(token: string | null) {
    try {
      if (token) {
        const response = await fetch("/api/auth/captcha", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const responseData = (await response.json()) as {
          message: string;
        };

        if (responseData.message === "Success") onSuccess();
      }
    } catch (e) {
      toast.error("Помилка перевірки капчі. Спробуйте ще раз.");
    }
  }

  const handleChange = (token: string | null) => {
    handleCaptchaSubmission(token);
  };

  function handleExpired() {
    toast.error("Термін дії капчі закінчився. Спробуйте ще раз.");
    recaptchaRef.current?.reset();
  }

  return (
    <ReCAPTCHA
      sitekey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      ref={recaptchaRef}
      onChange={handleChange}
      onExpired={handleExpired}
    />
  );
}
