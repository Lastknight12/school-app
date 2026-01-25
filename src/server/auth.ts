import { type UserRole } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { multiSession } from "better-auth/plugins";
import { headers } from "next/headers";
import { env } from "~/env";

import { cloudinary } from "~/lib/cloudinary";

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
  plugins: [multiSession()],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      async mapProfileToUser(profile) {
        // default avatar
        let image =
          "https://i.pinimg.com/736x/27/5f/99/275f99923b080b18e7b474ed6155a17f.jpg";
        try {
          const result = await cloudinary.uploader.upload(profile.picture, {
            folder: "avatars",
            resource_type: "image",
          });

          if (result?.secure_url) {
            image = result.secure_url;
          }
        } catch (error) {
          console.error(`Cloudinary upload failed: ${String(error)}`);
        }

        return { image };
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          console.log("created @#!()#*!@)(#*@!#&^#%(&@!^#*&@!&#)!@*&#*@!#&");
          let image =
            "https://i.pinimg.com/736x/27/5f/99/275f99923b080b18e7b474ed6155a17f.jpg";

          if (user.image) {
            try {
              const result = await cloudinary.uploader.upload(user.image, {
                folder: "avatars",
                resource_type: "image",
              });

              if (result?.secure_url) {
                image = result.secure_url;
              }
            } catch (error) {
              console.error(`Cloudinary upload failed: ${String(error)}`);
            }
          }

          return { data: { ...user, image } };
        },
      },
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
    headers: await headers(),
  });
};
