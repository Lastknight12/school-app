import { type UserRole } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { notFound, redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

import { type Session } from "~/server/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkRole(session: Session | null, roles: UserRole[]) {
  if (!session) return redirect("/login");

  if (!roles.includes(session.user.role)) {
    return notFound();
  }
}

export function truncateText(text: string, maxLength: number) {
  return text.slice(0, maxLength) + "...";
}
