import { PrismaAdapter } from "@auth/prisma-adapter";
import {type User } from "@prisma/client";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
interface CustomUser extends Omit<User, "emailVerified" | "studentClassId"> {
  studentClass?: {
    id: string;
    name: string;
  } | null,
  teacherClasses: {
    id: string;
    name: string;
  }[]
}

declare module "next-auth" {
  interface Session {
    user: CustomUser
    expires: DefaultSession["expires"]
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token }) => {
      const dbUser = await db.user.findFirst({
        where: { id: token.sub},
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          balance: true,
          role: true,
          studentClass: {
            select: {
              id: true,
              name: true,
            },
          },
          teacherClasses: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if(!dbUser) {
        return token
      }

      return {
        sub: token.sub,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        balance: dbUser.balance,
        role: dbUser.role,
        studentClass: dbUser.studentClass ?? null,
        teacherClasses: dbUser.teacherClasses.map((klass) => ({
          id: klass.id,
          name: klass.name,
        })),
      };
    },
    session: ({ session, token }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {sub, ...formattedToken} = token

      return {
        ...session,
        user: {
          id: token.sub,
          ...formattedToken,
        },
      };
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
