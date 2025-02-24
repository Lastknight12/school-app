import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import SellerHomePage from "../_components/homePages/sellerHome";
import StudentHomePage from "../_components/homePages/studentHome";
import TeacherHomePage from "../_components/homePages/teacherHome";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session) {
    return redirect("/login");
  }

  const userRole = session.user.role;

  switch (userRole) {
    case "STUDENT":
      return <StudentHomePage session={session} />;
    case "SELLER":
      return <SellerHomePage />;
    case "TEACHER":
      if (session.user.teacherClasses?.length === 0) {
        return (
          <div className="px-5">
            <p>
              Немає класів. Зачекайте поки адміністратор додасть вас у потрібний
              клас
            </p>
          </div>
        );
      }
      return <TeacherHomePage session={session} />;
    case "ADMIN":
      return redirect("/admin");
    case "RADIO_CENTER":
      return <StudentHomePage session={session} />;
  }
}
