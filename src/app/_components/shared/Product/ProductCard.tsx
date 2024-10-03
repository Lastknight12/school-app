import { type CategoryItem } from "@prisma/client";
import { cn } from "~/lib/utils";

interface Props {
  item: Omit<CategoryItem, "id" | "categoryId">;
  imageSize?: number;
  className?: string
}

export default function ProductCard({ item, imageSize, className }: Props) {
  return (
    <div className={cn("flex items-start gap-3 justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={item.image} width={imageSize} className=" rounded-lg"/>
      <div className="flex flex-col justify-center gap-2">
        <h1>{item.title.length > 15 ? item.title.slice(0, 15) + "..." : item.title}</h1>
        <p>Ціна: {item.pricePerOne + " Балів"}</p>
        <p>Кількість: {item.count}</p>
      </div>
    </div>
  );
}
