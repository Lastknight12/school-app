import { Loader2 } from "lucide-react";
import { Orbitron, Source_Code_Pro } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Toaster } from "sonner";
import NextAuthProvider from "~/providers/NextAuthProvider";

import { getServerAuthSession } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

import "../styles/globals.css";
import Sidebar from "./_components/shared/Sidebar";

import PageTransition from "~/app/_components/shared/PageTransition";

const metropolis = localFont({
  src: [
    {
      path: "../../fonts/Metropolis-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Metropolis-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-metropolis",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const source_code_pro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className="dark">
      <body
        className={`${metropolis.variable} ${orbitron.variable} ${source_code_pro.variable} overflow-x-hidden font-metropolis`}
      >
        <TRPCReactProvider>
          <NextAuthProvider>
            <Toaster
              toastOptions={{
                classNames: {
                  toast: "bg-[#333333] border-[#3e3b3b]",
                  title: "text-white",
                  icon: "text-white",
                },
              }}
              position="top-center"
            />

            <Sidebar session={session}>
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
                  </div>
                }
              >
                <PageTransition>
                  <div className="mt-3">{children}</div></PageTransition>
              </Suspense>
            </Sidebar>
          </NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
