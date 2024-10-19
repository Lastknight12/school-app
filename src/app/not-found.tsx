import Link from "next/link";

import { Button } from "~/shadcn/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-72px-16px)] items-center justify-center gap-1 flex-col w-[calc(100vw-24px-24px)] mx-auto">
      <h2 className="font-orbitron text-center text-8xl text-red-500">404</h2>
      <p className="text-center text-xl text-[#636363] font-source_code_pro">
        Сторінку не знайдено
      </p>
      <Link href="/">
        <Button className=" bg-transparent border mt-6 border-[#454545] text-[#b3b3b3]">
          На головну
        </Button>
      </Link>
    </div>
  );
}
