import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import ProductCard from "../../shared/ProductCard";
import { CategoryItem } from "@prisma/client";
import { cn } from "~/lib/utils";

interface Props {
  items: CategoryItem[];
  className?: string;
  imageSize?: number
}

export function ProductCarousel({ items, className, imageSize }: Props) {
  return (
    <Carousel className="w-full max-w-[377px] gap-8">
      <CarouselPrevious />
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
            <div>
              <ProductCard item={item} className={cn("max-mobile:flex-col items-center", className)} imageSize={imageSize}/>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
    </Carousel>
  );
}
