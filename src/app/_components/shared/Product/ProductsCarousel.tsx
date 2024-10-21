import { type CategoryItem } from "@prisma/client";

import { cn } from "~/lib/utils";

import ProductCard from "./ProductCard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/shadcn/ui/carousel";

interface Props {
  items: CategoryItem[];
  className?: string;
  imageSize?: number;
}

export function ProductCarousel({ items, className, imageSize }: Props) {
  return (
    <Carousel className="w-full max-w-[377px] gap-8">
      <CarouselPrevious />
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
            <div>
              <ProductCard
                item={item}
                className={cn(
                  "select-none items-center max-mobile:flex-col",
                  className,
                )}
                imageSize={imageSize}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
    </Carousel>
  );
}
