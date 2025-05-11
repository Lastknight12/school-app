import Image from "next/image";

import { cn } from "~/lib/utils";

import ProductCard from "~/app/_components/shared/ProductCard";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";

interface Product {
  id: string;
  image: string;
  title: string;
  pricePerOne: number;
  count: number;
  Category: {
    name: string;
  };
}

interface Props {
  products: Product[];
  maxLength?: number;
}

export default function ProductsModal({ products, maxLength = 4 }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center">
          {products.slice(0, maxLength).map((product, i) => (
            <div
              key={product.id}
              className={cn(
                "relative z-10 h-10 w-10 overflow-hidden rounded-full",
                i > 0 ? `-ml-5` : "ml-0",
              )}
            >
              <Image
                src={product.image}
                alt={product.id}
                fill
                className="object-cover"
              />
            </div>
          ))}
          {products.length > maxLength && (
            <div className="ml-2">+{products.length - maxLength}</div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Products</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {products.map((product) => (
            <ProductCard
              product={product}
              key={product.id}
              customLabels={{
                productDbCount: () => "",
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
