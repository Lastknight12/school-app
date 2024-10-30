import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { updateUserSchema } from "~/schemas/zod";

import {
  adminProcedure,
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

  getUsers: adminProcedure
    .input(
      z
        .object({
          role: z.enum([
            UserRole.STUDENT,
            UserRole.TEACHER,
            UserRole.ADMIN,
            UserRole.SELLER,
            UserRole.RADIO_CENTER,
          ]),
        })
        .nullish(),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.user.findMany({
        where: {
          role: input?.role ?? undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          image: true,
          badges: true,
          badge_for_assignment: true,
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
    }),

  getAllBadges: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.badge.findMany();
  }),

  addBadge: adminProcedure
    .input(
      z.object({
        name: z.string(),
        textColor: z.string(),
        backgroundColor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.badge.create({
        data: {
          name: input.name,
          textColor: input.textColor,
          backgroundColor: input.backgroundColor,
        },
      });
    }),

  setActiveBadge: protectedProcedure
    .input(
      z.object({
        badgeName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          activeBadge: {
            connect: {
              name: input.badgeName,
            },
          },
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
    .input(updateUserSchema)
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

  updateUserBadges: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        badges: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            textColor: z.string(),
            backgroundColor: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          badges: {
            set: input.badges,
          },
        },
      });
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum([
          UserRole.ADMIN,
          UserRole.TEACHER,
          UserRole.STUDENT,
          UserRole.SELLER,
          UserRole.RADIO_CENTER,
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: input.newRole,
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
        where: {
          role: "STUDENT"
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.limit ? input.limit + 1 : undefined,
        orderBy: {
          balance: "desc",
        },
        select: {
          id: true,
          name: true,
          image: true,
          balance: true,
          badges: true,
          activeBadge: true,
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
