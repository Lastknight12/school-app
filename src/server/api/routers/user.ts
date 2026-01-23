import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { updateUserSchema } from "~/schemas/zod";

import {
  authorizeRoles,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUsersByNameOrEmail: protectedProcedure
    .input(
      z.object({
        searchTerm: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.searchTerm == "") return [];
      const users = await ctx.db.user.findMany({
        where: {
          OR: [
            { email: { contains: input.searchTerm, mode: "insensitive" } },
            { name: { contains: input.searchTerm, mode: "insensitive" } },
          ],
          role:
            ctx.session.user.role === "ADMIN"
              ? {
                  in: ["STUDENT", "TEACHER"],
                }
              : "STUDENT",
        },
      });

      return users;
    }),

  getUsersByRole: authorizeRoles(["ADMIN"])
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

  getUserClass: authorizeRoles(["STUDENT"]).query(async ({ ctx }) => {
    const klass = await ctx.db.klass.findFirst({
      where: {
        students: {
          some: { id: ctx.session.user.id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return klass;
  }),

  getTeacherKlasses: authorizeRoles(["TEACHER"]).query(async ({ ctx }) => {
    return await ctx.db.klass.findMany({
      where: {
        teachers: {
          some: { id: ctx.session.user.id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
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

  updateUserRole: authorizeRoles(["ADMIN"])
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
        limit: z.number().min(3).max(25).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 25;

      const users = await ctx.db.user.findMany({
        where: {
          role: "STUDENT",
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: input.limit ? input.limit + 1 : undefined,
        orderBy: [{ balance: "desc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          image: true,
          balance: true,
        },
      });

      if (users.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Жодного користувача не знайдено",
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

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userExist = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!userExist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Користувача не існує",
        });
      }

      await ctx.db.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
