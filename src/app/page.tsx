import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

import SellerHomePage from "./_components/(seller)/home";
import StudentHomePage from "./_components/(student)/home";
import TeacherHomePage from "./_components/(teacher)/home/HomePage";

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
    // in case that radio_center is also student
    case "RADIO_CENTER":
      return <StudentHomePage session={session} />;
  }
}
