import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import SellerHomePage from "../_components/authorizedPages/HomePages/sellerHome";
import StudentHomePage from "../_components/authorizedPages/HomePages/studentHome";
import TeacherHomePage from "../_components/authorizedPages/HomePages/teacherHome/HomePage";

export default async function Home() {
  const session = await getServerAuthSession();

  const userRole = session!.user.role;

  switch (userRole) {
    case "STUDENT":
      return <StudentHomePage session={session!} />;
    case "SELLER":
      return <SellerHomePage />;
    case "TEACHER":
      if (session!.user.teacherClasses?.length === 0) {
        return (
          <div className="px-5">
            <p>
              Немає класів. Зачекайте поки адміністратор додасть вас у потрібний
              клас
            </p>
          </div>
        );
      }
      return <TeacherHomePage session={session!} />;
    case "ADMIN":
      return redirect("/admin");
    case "RADIO_CENTER":
      return <StudentHomePage session={session!} />;
  }
}
