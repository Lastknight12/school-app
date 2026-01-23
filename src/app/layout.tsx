import { SpeedInsights } from "@vercel/speed-insights/next";
import { Loader2 } from "lucide-react";
import { Orbitron, Source_Code_Pro } from "next/font/google";
import localFont from "next/font/local";
import { Suspense } from "react";
import { Toaster } from "sonner";

import { getServerAuthSession } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

import "../styles/globals.css";
import Sidebar from "./_components/shared/Sidebar";

import PageTransition from "~/app/_components/shared/PageTransition";

const e_ukraine = localFont({
  src: [
    {
      path: "../../fonts/e-Ukraine-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/e-Ukraine-UltraLight.otf",
      weight: "200",
      style: "normal",
    },
  ],
  variable: "--font-e_ukraine",
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
        className={` ${e_ukraine.variable} ${orbitron.variable} ${source_code_pro.variable} overflow-x-hidden font-e_ukraine`}
      >
        <SpeedInsights />

        <TRPCReactProvider>
          <Toaster
            toastOptions={{
              classNames: {
                toast: "bg-card border-border",
                title: "text-card-foreground",
                icon: "text-card-foreground",
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
                <div>{children}</div>
              </PageTransition>
            </Suspense>
          </Sidebar>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
