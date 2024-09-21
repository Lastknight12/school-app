import Image from "next/image";
import { getServerAuthSession } from "~/server/auth";
import NavbarLeftItem from "./StudentItem";
import TeacherItem from "./TeacherItem";
import ShoppingCart from "../../(seller)/home/ShoppingCart";

export default async function Navbar() {
  const session = await getServerAuthSession();

  if (!session) {
    return null;
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3 text-white">
        {session?.user.role === "TEACHER" && <TeacherItem />}
        {session?.user.role === "STUDENT" && (
          <NavbarLeftItem userBalance={session.user.balance} />
        )}
        {session?.user.role === "ADMIN" && <div>Admin Panel</div>}
        {session?.user.role === "SELLER" && <ShoppingCart />}
      </div>

      <div>
        {session?.user && (
          <Image
            src={session.user.image!}
            className="rounded-full"
            alt="avatar"
            width={40}
            height={40}
          />
        )}
      </div>
    </nav>
  );
}
