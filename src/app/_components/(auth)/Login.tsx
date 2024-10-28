"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FaDiscord, FaGoogle } from "react-icons/fa";
import { toast } from "sonner";

interface loginOptions {
  name: string;
  icon: React.ReactNode;
  callbackFn: () => void;
}

export default function Login() {
  const error = useSearchParams().get("error");

  useEffect(() => {
    console.log(error)
    switch (error) {
      case "OAuthAccountNotLinked":
        toast.error("Аккаунт прікріплено не до цього методу входу");
        break
      case "OAuthCallback":
        toast.error("Виникла помилка під час входу");
        break
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
          <button
            key={option.name}
            onClick={option.callbackFn}
            className="flex items-center gap-5 rounded-md bg-card px-5 py-2"
          >
            {option.icon}
            {option.name}
          </button>
        ))}
      </div>
    </main>
  );
}
