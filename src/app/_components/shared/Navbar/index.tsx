import { type UserRole } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { getServerAuthSession } from "~/server/auth";

import ShoppingCart from "../../(seller)/home/ShoppingCart";
import BurgerMenu from "../BurgerMenu";
import AdminItem from "./AdminItem";
import ScanQr from "./ScanQr";
import StudentItem from "./StudentItem";
import TeacherItem from "./TeacherItem";

const urls = new Map<string, UserRole[]>([
  ["/", ["TEACHER", "ADMIN", "SELLER", "STUDENT", "RADIO_CENTER"]],
  ["/leaderboard", ["ADMIN", "SELLER", "TEACHER", "STUDENT", "RADIO_CENTER"]],
  ["/settings", ["TEACHER", "ADMIN", "SELLER", "STUDENT", "RADIO_CENTER"]],
  ["/admin", ["ADMIN"]],
  ["/admin/transfers", ["ADMIN"]],
  ["/transactions", ["ADMIN"]],
  ["/stats", ["STUDENT", "RADIO_CENTER"]],
  ["/shop", ["STUDENT", "RADIO_CENTER"]],
  ["/music", ["STUDENT", "RADIO_CENTER"]],
  ["/music/player", ["RADIO_CENTER"]],
  ["/musicOrders", ["RADIO_CENTER"]],
]);

export default async function Navbar() {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const allowedUrls: string[] = [];
  // check allowed urls
  urls.forEach((item, url) => {
    if (item.includes(session.user.role)) return allowedUrls.push(url);
  });

  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3 text-white">
        <BurgerMenu allowedUrls={allowedUrls} />

        {session?.user.role === "TEACHER" && <TeacherItem session={session} />}
        {session?.user.role === "STUDENT" && (
          <>
            <StudentItem userBalance={session.user.balance} />
            <ScanQr />
          </>
        )}
        {session?.user.role === "ADMIN" && <AdminItem />}
        {session?.user.role === "SELLER" && <ShoppingCart />}
      </div>

      <div>
        {session?.user && (
          <Link href="/settings" className=" cursor-pointer">
            <Image
              src={session.user.image}
              className="rounded-full h-10"
              alt="avatar"
              width={40}
              height={40}
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
