import { Orbitron, Source_Code_Pro } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import NextAuthProvider from "~/providers/NextAuthProvider";

import { TRPCReactProvider } from "~/trpc/react";

import "../styles/globals.css";

import Navbar from "~/app/_components/shared/Navbar";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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

            <Navbar />

            <PageTransition>{children}</PageTransition>
          </NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
