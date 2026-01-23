import { type UserRole } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { env } from "~/env";

import { db } from "./db";

export type CustomUser = {
  id: string;
  name: string;
  email: string;
  image: string;
  balance: number;
  role: UserRole;
};

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      balance: {
        type: "number",
        required: true,
        defaultValue: 0,
      },
      role: {
        type: ["STUDENT", "TEACHER", "ADMIN", "RADIO_CENTER", "SELLER"],
        required: true,
        defaultValue: "STUDENT",
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

export const getServerAuthSession = async () => {
  return await auth.api.getSession({
    headers: headers(),
  });
};
