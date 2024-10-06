"use client";

// this component dont used in project, but i want to keep it :)

import { BiHome } from "react-icons/bi";
import { IoMdStats } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import { FiShoppingBag } from "react-icons/fi";
import { useRef } from "react";
import { cn } from "~/lib/utils";
import { Settings } from "lucide-react";

interface Props {
  allowedUrls?: string[];
  position?: "left" | "bottom";
}

export default function BottomNavigation({
  allowedUrls,
  position = "bottom",
}: Props) {
  const pathname = usePathname();

  // position when stick works (like swipe witput user to corner)
  const actionYPoint = -30;
  const actionXPoint = 30;

  const bottomYPoint = 0;
  const leftXPoint = 0;

  // cant be > 0
  const topYPoint = -85.6;
  // cant be < 0
  const rightXPoint = 88;

  const [{ y, x }, api] = useSpring(() => ({
    y: bottomYPoint,
    x: leftXPoint,
  }));

  const bind = useDrag(
    async ({ down, offset }) => {
      if (position === "left") {
        // right swipe
        if (offset[0] > actionXPoint && !down) {
          offset[0] = rightXPoint;
          await Promise.all(api.start({ x: rightXPoint, immediate: down }));
        }
        // left swipe
        else if (offset[0] < actionXPoint && !down) {
          offset[0] = leftXPoint;
          await Promise.all(api.start({ x: leftXPoint, immediate: down }));
        } else {
          return api.start({ x: offset[0], immediate: down });
        }
      } else {
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
      }
    },
    {
      bounds: {
        top: topYPoint,
        bottom: bottomYPoint,
        left: leftXPoint,
        right: rightXPoint,
      },
      rubberband: true,
    },
  );

  // navigation items and icons that be displayed
  // when add some items add route in middleware.ts
  const navigationItems = [
    { name: "Home", href: "/", icon: <BiHome size={24} /> },
    {
      name: "Transactions",
      href: "/transactions",
      icon: <GrTransaction size={24} />,
    },
    { name: "Stats", href: "/stats", icon: <IoMdStats size={24} /> },
    { name: "Shop", href: "/shop", icon: <FiShoppingBag size={24} /> },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings size={24} />,
    }
  ];

  const rootEl = useRef<HTMLDivElement>(null);

  const allowedNavItems = allowedUrls ? navigationItems.filter(
    (item) => allowedUrls.includes(item.href) || item.href === "/",
  ) : navigationItems;

  // if current path not included in navigation items, hide element
  if (!allowedNavItems.some((item) => item.href === pathname))
    return null;

  return (
    <>
      <animated.div
        ref={rootEl}
        style={{
          x: position === "left" ? x : undefined,
          y: position === "bottom" ? y : undefined,
        }}
        className={cn(
          // 73.6px and 66px are the width and height of the bottom navigation
          position === "left" && "left-[calc(0%-73.6px)]",
          position === "bottom" && "bottom-[calc(0%-66px)]",
          "absolute rounded-sm border border-[#fafafa15] bg-[#28292b] backdrop-blur-sm",
        )}
      >
        {/* Top line */}
        <button
          {...bind()}
          className={cn(
            position === "left" &&
              "-right-4 top-1/2 h-1/2 w-4 -translate-y-1/2 rounded-br-full rounded-tr-full border-l-[#28292b]",
            position === "bottom" &&
              "-top-4 left-1/2 h-4 w-1/2 -translate-x-1/2 rounded-tl-full rounded-tr-full border-b-[#28292b]",
            `absolute touch-none border border-[#fafafa15] bg-[#28292b]`,
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            <div
              className={cn(
                position === "left" && "h-2/5 w-[2px]",
                position === "bottom" && "h-[2px] w-2/5",
                "bg-[#5a5a5b]",
              )}
            />
          </div>
        </button>

        <div className={cn(position === "left" && "flex-col", "flex")}>
          {allowedNavItems.map((item) => (
            <Link key={item.name} href={item.href} className="px-6 py-5">
              <div
                className={`${pathname === item.href ? "text-[#4181FF]" : "text-[#fafafa]"}`}
              >
                {item.icon}
              </div>
            </Link>
          ))}
        </div>
      </animated.div>
    </>
  );
}
