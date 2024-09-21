import { CategoryItem } from "@prisma/client";
import { cn } from "~/lib/utils";

interface Props {
  item: Omit<CategoryItem, "id" | "categoryId">;
  imageSize?: number;
  className?: string
}

export default function ProductCard({ item, imageSize, className }: Props) {
  return (
    <div className={cn("flex items-start gap-3 justify-center", className)}>
      <img src={item.image} width={imageSize} className=" rounded-lg"/>
      <div className="flex flex-col justify-center gap-2">
        <h1>{item.title}</h1>
        <p>Ціна: {item.pricePerOne + " Балів"}</p>
        <p>Кількість: {item.count}</p>
      </div>
    </div>
  );
}
