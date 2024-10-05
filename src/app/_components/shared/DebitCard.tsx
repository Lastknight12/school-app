"use client"

import Image, { type StaticImageData } from "next/image";
import { cn } from "~/lib/utils";
import variant_2 from "images/variant-2.png";
import variant_1 from "images/variant-1.png";
import variant_3 from "images/variant-3.png";
import variant_4 from "images/variant-4.png";
import variant_5 from "images/variant-5.png";
import variant_6 from "images/variant-6.png";
import { BiLogoVisa } from "react-icons/bi";
import { Nfc } from "lucide-react";
import { useCardVariant } from "~/lib/state";

const cardWidth = 350;
const cardHeight = 200;

interface Props {
  balance: number;
  cardHolder: string;
  className?: string;
  variant?: number;
}

const variants: {
  variant: number;
  twBg?: string;
  image?: StaticImageData;
  isBgGradient?: boolean;
  twGradient?: string;
  color?: string;
}[] = [
  {
    variant: 1,
    twBg: "bg-[#FFD0EC]",
    image: variant_1,
  },
  {
    variant: 2,
    twBg: "bg-white",
    image: variant_2,
  },
  {
    variant: 3,
    twBg: "bg-[#BB85E5]",
    image: variant_3,
  },
  {
    variant: 4,
    twBg: "bg-[#B9E7C6]",
    image: variant_4,
  },
  {
    variant: 5,
    twBg: "bg-[white]",
    image: variant_5,
  },
  {
    variant: 6,
    twBg: "bg-[#74A3FD]",
    image: variant_6,
  },
  {
    variant: 7,
    isBgGradient: true,
    twGradient: "bg-gradient-to-b from-[#C4AED9] via-[#E091ED] to-[#632C9A]",
  },
];

export default function DebitCard({
  balance,
  cardHolder,
  className,
  variant,
}: Props) {
  const currentCardVariant = useCardVariant((state) => state.variant);
  
  const variant_ = variants.find((v) => v.variant === (variant ?? currentCardVariant)) ?? variants[1]!;

  return (
    <div
      style={{
        height: cardHeight + "px",
        width: cardWidth + "px",
      }}
      className={cn(
        `relative rounded-[21px] p-5`,
        className,
        variant_.isBgGradient ? variant_.twGradient : variant_.twBg,
      )}
    >
      {variant_.image && (
        <Image
          src={variant_.image.src}
          alt="bg"
          style={{ height: cardHeight + "px", width: cardWidth + "px" }}
          width={cardWidth}
          height={cardHeight}
          className="absolute bottom-0 left-0 z-10 rounded-[21px]"
          blurDataURL={variant_1.blurDataURL}
        />
      )}

      <div className="sticky z-10 flex h-full w-full flex-col justify-between">
        {/* Top items */}
        <div
          className="flex items-center justify-between"
          style={{ color: variant_.color ?? "black" }}
        >
          <BiLogoVisa size={60} />
          <p className="text-xl">{"$" + balance}</p>
        </div>

        {/* Center items */}
        <div
          className="flex items-center justify-between"
          style={{ color: variant_.color ?? "black" }}
        >
          <p className="text-lg font-bold">5551 1111 2222 3333</p>

          <Nfc size={33} />
        </div>

        {/* Bottom items */}
        <div
          className="flex gap-7"
          style={{ color: variant_.color ?? "black" }}
        >
          <div className="flex flex-col">
            <p className="text-[10px]">Card holder</p>
            <p>{cardHolder}</p>
          </div>

          <div className="flex flex-col">
            <p className="text-[10px]">Expires</p>
            <p>12/25</p>
          </div>

          <div className="flex flex-col">
            <p className="text-[10px]">CVV</p>
            <p>666</p>
          </div>
        </div>
      </div>
    </div>
  );
}
