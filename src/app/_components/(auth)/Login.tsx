"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FaDiscord, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "~/shadcn/ui/button";

interface loginOptions {
  name: string;
  icon: React.ReactNode;
  callbackFn: () => void;
}

export default function Login() {
  const error = useSearchParams().get("error");

  useEffect(() => {
    switch (error) {
      case "OAuthAccountNotLinked":
        toast.error("Аккаунт прікріплено не до цього методу входу");
        break;
      case "OAuthCallback":
        toast.error("Виникла помилка під час входу");
        break;
    }
  }, [error]);

  const loginOptions: loginOptions[] = [
    {
      name: "Discord",
      icon: <FaDiscord size={24} />,
      callbackFn: () =>
        void signIn("discord", { redirect: true, callbackUrl: "/" }),
    },
    {
      name: "Google",
      icon: <FaGoogle size={24} />,
      callbackFn: () =>
        void signIn("google", { redirect: true, callbackUrl: "/" }),
    },
  ];

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-3">
      <h1>Увійдіть за допомогою:</h1>
      <div className="flex flex-col gap-3">
        {loginOptions.map((option) => (
          <Button
            variant="secondary"
            key={option.name}
            onClick={option.callbackFn}
          >
            {option.icon}
            {option.name}
          </Button>
        ))}
      </div>
    </main>
  );
}
