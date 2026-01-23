import Link from "next/link";

interface Props {
  klasses: {
    id: string;
    name: string;
  }[];
}

export default function TeacherHomePage({ klasses }: Props) {
  return (
    <main className="mx-5 px-6">
      <div className="flex w-full flex-col gap-2">
        {klasses.map((teacherClass) => (
          <Link
            key={teacherClass.id}
            href={`/klass/${teacherClass.id}?formatedName=${teacherClass.name}`}
            className="flex w-full cursor-pointer justify-center rounded-md bg-card py-6 text-lg"
          >
            {teacherClass.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
