import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="fixed flex items-center gap-1 flex-col top-1/2 w-[calc(100vw-24px-24px)] -translate-y-1/2">
      <h2 className="font-orbitron text-center text-8xl text-red-500">404</h2>
      <p className="text-center text-xl text-[#636363] font-source_code_pro">Сторінку не знайдено</p>
      <Link href="/">
        <Button className=" bg-transparent border mt-6 border-[#454545] text-[#b3b3b3]">На головну</Button>
      </Link>
    </div>
  );
}
