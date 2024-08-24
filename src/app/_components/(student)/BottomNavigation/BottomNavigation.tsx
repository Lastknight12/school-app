/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { BiHome } from "react-icons/bi";
import { IoMdStats } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";

interface Props {
  allowedUrls: string[];
}

export default function BottomNavigation({ allowedUrls }: Props) {
  const pathname = usePathname();
  const actionYPoint = -35;
  const bottomYPoint = 0;
  const topYPoint = -85.6;

  const [{ y }, api] = useSpring(() => ({
    y: bottomYPoint,
  }));

  const bind = useDrag(
    async ({ down, offset }) => {
      // top swipe
      if (offset[1] < actionYPoint && !down) {
        offset[1] = topYPoint;
        await Promise.all(api.start({ y: topYPoint, immediate: down }));
      }
      // bottom swipe
      else if (offset[1] > actionYPoint && !down) {
        offset[1] = bottomYPoint;
        await Promise.all(api.start({ y: bottomYPoint, immediate: down }));
      } else {
        return api.start({ y: offset[1], immediate: down });
      }
    },
    {
      bounds: { top: topYPoint, bottom: bottomYPoint },
      rubberband: true,
    },
  );

  const navigationItems = [
    { name: "Home", href: "/", icon: <BiHome size={24} /> },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <GrTransaction size={24} />,
    },
    { name: "Stats", href: "/stats", icon: <IoMdStats size={24} /> },
  ];

  const filteredNavigationItems = navigationItems.filter(
    (item) => allowedUrls.includes(item.href) || item.href === "/",
  );

  return (
    <animated.div
      style={{
        y,
        // 24px * 2 padding on left and right,
        // 40px * items - 1 gap between items,
        // 24px * 2 items width

        left: `calc(50% - (24px * 2 + 40px * ${filteredNavigationItems.length - 1} + 24px * ${filteredNavigationItems.length}) / 2) !important`,
      }}
      className={`fixed bottom-[calc(0%-65.6px)] rounded-bl-sm rounded-br-sm border border-[#fafafa15] bg-[#28292b] py-5 backdrop-blur-sm`}
    >
      {/* Top line */}
      <button
        {...bind()}
        className={`fixed -top-4 left-[-1px] flex h-4 w-[calc(100%+2px)] touch-none items-center justify-center rounded-tl-full rounded-tr-full border border-[#fafafa15] border-b-[#28292b] bg-[#28292b]`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-[2px] w-[40%] bg-[#5a5a5b]" />
        </div>
      </button>
      <div className="flex gap-10 px-6">
        {filteredNavigationItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={`${pathname === item.href ? "text-[#4181FF]" : "text-[#fafafa]"}`}
            >
              {item.icon}
            </div>
          </Link>
        ))}
      </div>
    </animated.div>
  );
}
