import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcerure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUsersByName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.name == "") return [];
      const users = await ctx.db.user.findMany({
        where: {
          name: {
            contains: input.name,
          },
          role: "TEACHER",
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

  getUserClass: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.studentClass) return;

    const klass = await ctx.db.klass.findUnique({
      where: {
        id: ctx.session.user.studentClass.id,
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

  updateUser: protectedProcedure
    .input(
      z.object({
        newName: z.string().min(1, "Назва користувача не може бути пустою"),
        newImageSrc: z.string().min(1, "Аватарка не може бути пустою"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.newName,
          image: input.newImageSrc,
        },
      });
    }),

  getLeaderboard: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(3).max(50).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;

      const users = await ctx.db.user.findMany({
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.limit ? input.limit + 1 : undefined,
        orderBy: {
          balance: "desc",
        },
      });

      let nextCursor: string | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        users,
        nextCursor,
      };
    }),
});
