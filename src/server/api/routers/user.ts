import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcerure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUsersByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.name == "") return [];
      const users = await ctx.db.user.findMany({
        where: {
          name: {
            contains: input.name,
          },
          role: "STUDENT",
        },
      });

      return users;
    }),

  getAllTeachers: adminProcerure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        role: "TEACHER",
      },
    });
  }),

  getAllStudents: adminProcerure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        role: "STUDENT",
      },
    });
  }),

  getUserClass: protectedProcedure
    .input(z.object({ id: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      if (!input.id) return null;

      const klass = await ctx.db.klass.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          students: {
            select: {
              id: true,
            },
          },
          name: true,
        },
      });

      if (
        !klass?.students.some((student) => student.id === ctx.session.user.id)
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Ти не знаходишся у цьому класі",
        });
      }

      return klass;
    }),

    updateUser: protectedProcedure.input(z.object({
      newName: z.string().min(1, "Назва користувача не може бути пустою"),
      newImageSrc: z.string().min(1, "Аватарка не може бути пустою"),
    })).mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: {
          id: ctx.session.user.id
        },
        data: {
          name: input.newName,
          image: input.newImageSrc
        }
      })
    })
});
