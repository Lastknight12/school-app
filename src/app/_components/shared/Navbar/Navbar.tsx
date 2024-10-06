import Image from "next/image";
import { getServerAuthSession } from "~/server/auth";
import TeacherItem from "./TeacherItem";
import ShoppingCart from "../../(seller)/home/ShoppingCart";
import StudentItem from "./StudentItem";
import ScanQr from "./ScanQr";
import AdminItem from "./AdminItem";
import Link from "next/link";
import BurgerMenu from "../BurgerMenu";
import { urls } from "~/middleware";

export default async function Navbar() {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  const allowedUrls: string[] = [];
  // check allowed urls
  urls.forEach((value, url) => {
    if (value.includes(session.user.role)) return allowedUrls.push(url);
  });

  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3 text-white">
        
        <BurgerMenu allowedUrls={allowedUrls} />

        {session?.user.role === "TEACHER" && <TeacherItem />}
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
              src={session.user.image!}
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
