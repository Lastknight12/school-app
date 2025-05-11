import Image from "next/image";

import { Badge } from "~/shadcn/ui/badge";

export interface CardProduct {
  id: string;
  image: string;
  title: string;
  pricePerOne: number;
  count: number;
  Category?: {
    name: string;
  };
}

interface Props {
  product: CardProduct;
  customLabels?: {
    productDbCount?: (count: number) => string;
  };
}

export default function ProductCard({ product, customLabels }: Props) {
  return (
    <div className="flex flex-col space-y-2 border rounded-lg p-4">
      <div className="relative h-40 w-full overflow-hidden rounded-md">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover"
        />
        {product.count === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive" className="text-sm">
              Немає в наявності
            </Badge>
          </div>
        )}
      </div>
      <h3 className="font-medium text-start">{product.title}</h3>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">₴ {product.pricePerOne.toFixed(2)}</span>
        <span className="text-muted-foreground">
          {customLabels?.productDbCount
            ? customLabels.productDbCount(product.count)
            : `Кількість: ${product.count}`}
        </span>
      </div>
      {product.Category && (
        <span className="text-xs px-2 py-1 bg-muted rounded-full w-fit">
          {product.Category.name}
        </span>
      )}
    </div>
  );
}
