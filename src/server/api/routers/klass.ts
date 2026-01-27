import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addKlassSchema } from "~/schemas/zod";

import { authorizeRoles, createTRPCRouter } from "~/server/api/trpc";

export const klassRouter = createTRPCRouter({
  getAllKlasses: authorizeRoles(["ADMIN"]).query(async ({ ctx }) => {
    return await ctx.db.klass.findMany({
      select: {
        name: true,
      },
    });
  }),

  getKlassStudents: authorizeRoles(["ADMIN"])
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const klass = await ctx.db.klass.findFirst({
        where: {
          id: input.id,
        },
        select: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              balance: true,
            },
          },
        },
      });

      if (!klass?.students) {
        return [];
      }

      return klass.students;
    }),

  getAdminKlassData: authorizeRoles(["ADMIN"])
    .input(z.object({ name: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.klass.findFirst({
        where: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          teachers: true,
          students: true,
        },
      });
    }),

  getTeacherKlassData: authorizeRoles(["TEACHER"])
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.klass.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          students: true,
        },
      });
    }),

  addKlass: authorizeRoles(["ADMIN"])
    .input(addKlassSchema)
    .mutation(async ({ ctx, input }) => {
      const isExist = await ctx.db.klass.findFirst({
        where: {
          name: input.name,
        },
      });

      if (isExist) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Клас вже існує",
        });
      }

      await ctx.db.klass.create({
        data: {
          name: input.name,
        },
      });
    }),

  updateUsers: authorizeRoles(["ADMIN"])
    .input(
      z.object({
        klassId: z.string(),
        usersIds: z
          .array(z.string())
          .min(1, "Відсутній спискок Id користувачів"),
        usersRole: z.enum(["STUDENT", "TEACHER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: {
          id: {
            in: input.usersIds,
          },
          role: input.usersRole,
        },
      });

      if (users.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Не знайдено жодного користувача за наданими Id",
        });
      }

      await ctx.db.klass.update({
        where: {
          id: input.klassId,
        },
        data: {
          teachers: input.usersRole === "TEACHER" ? { set: users } : undefined,
          students: input.usersRole === "STUDENT" ? { set: users } : undefined,
        },
      });
    }),
});
