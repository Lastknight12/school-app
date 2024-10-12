"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useState } from "react";
import { BiHome } from "react-icons/bi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FiShoppingBag } from "react-icons/fi";
import { GrTransaction } from "react-icons/gr";
import { IoMdClose, IoMdStats } from "react-icons/io";
import { MdAdminPanelSettings, MdLeaderboard } from "react-icons/md";
import { PiHamburger } from "react-icons/pi";

import { cn } from "~/lib/utils";

import useClickOutside from "~/hooks/useClickOutside";
import { useDebounceValue } from "~/hooks/useDebounceValue";

interface Props {
  allowedUrls?: string[];
}

export default function BurgerMenu({ allowedUrls }: Props) {
  const [isOpen, setOpen] = useState(false);
  // wait until menu dont close
  const debauncedIsOpen = useDebounceValue(isOpen, 200);

  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  // all items used here must be added to middleware.ts
  const navigationItems = [
    { name: "Home", href: "/", icon: <BiHome size={24} /> },
    {
      name: "Admin Panel",
      href: "/admin",
      icon: <MdAdminPanelSettings size={24} />,
    },
    {
      name: "Transfers",
      href: "/admin/transfers",
      icon: <FaMoneyBillTransfer size={24} />,
    },
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
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: <MdLeaderboard size={24} />,
    },
  ];

  const allowedNavItems = allowedUrls
    ? navigationItems.filter((item) => allowedUrls.includes(item.href))
    : navigationItems;

  return (
    <div className="relative flex">
      <button ref={ref}>
        <PiHamburger size={25} onClick={() => setOpen((prev) => !prev)} />
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "shadow-4xl fixed left-0 top-0 z-50 flex h-screen w-full flex-col bg-[#15151569] backdrop-blur-lg",
          !debauncedIsOpen && "pointer-events-none",
        )}
      >
        <IoMdClose
          className="my-5 ml-auto mr-2"
          size={35}
          onClick={() => setOpen(false)}
        />

        <ul className="my-auto grid gap-2 px-6" ref={ref}>
          {allowedNavItems.map((item, idx) => {
            const { icon, name, href } = item;

            return (
              <motion.li
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: isOpen ? 0.1 + idx / 20 : 0,
                }}
                key={name}
                className="rounded-xl bg-gradient-to-tr"
              >
                <Link
                  onClick={() => setOpen((prev) => !prev)}
                  className={
                    "flex items-center justify-between rounded-xl bg-[#0a0a0a] p-5"
                  }
                  href={href}
                >
                  <span className="flex gap-1 text-lg">{name}</span>
                  {icon}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
