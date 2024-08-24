import NextAuthProvider from "~/providers/NextAuthProvider";
import { TRPCReactProvider } from "~/trpc/react";
import localFont from "next/font/local";
import Navbar from "./_components/shared/Navbar/Navbar";
import "../styles/globals.css";
import BottomNavigationWrapper from "./_components/(student)/BottomNavigation/BottomNavigationContainer";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${metropolis.className}`}>
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
            {children}
            <BottomNavigationWrapper />
          </NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
