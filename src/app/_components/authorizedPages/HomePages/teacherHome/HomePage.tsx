import { type Session } from "next-auth";
import Link from "next/link";

interface Props {
  session: Session
}

export default function TeacherHomePage({ session }: Props) {

  return (
    <main className="mx-5 px-6">
      <div className="flex w-full flex-col gap-2">
        {session.user.role === "TEACHER" && session.user.teacherClasses.map((teacherClass) => (
          <Link
            key={teacherClass.id}
            href={`/klass/${teacherClass.id}?formatedName=${teacherClass.name}`}
            className="flex w-full cursor-pointer justify-center rounded-md bg-card border border-border py-6 text-lg"
          >
            {teacherClass.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
