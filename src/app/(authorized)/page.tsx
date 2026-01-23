import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

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
      const klasses = await api.user.getTeacherKlasses();
      return <TeacherHomePage klasses={klasses} />;
    case "ADMIN":
      return redirect("/admin");
    case "RADIO_CENTER":
      return <StudentHomePage session={session} />;
  }
}
