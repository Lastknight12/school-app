import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import StudentHomePage from "./_components/(student)/home";
import SellerHomePage from "./_components/(seller)/home";
import TeacherHomePage from "./_components/(teacher)/home/HomePage";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return redirect("/login");
  }

  const userRole = session.user.role;

  switch (userRole) {
    case "STUDENT":
      if (!session.user.klassId)
        return (
          <div className="px-5">
            <p className=" text-center">Зачекайте поки адміністратор добавить вас в потрібний клас</p>
          </div>
        );
      return <StudentHomePage />;
    case "SELLER":
      return <SellerHomePage />;
    case "TEACHER":
      if (session.user.teacherInIds?.length === 0) {
        return (
          <div className="px-5">
            <p>Зачекайте поки адміністратор добавить вас в потрібний клас</p>
          </div>
        );
      }
      return <TeacherHomePage />;
    case "ADMIN":
      return redirect("/admin");
  }
}
