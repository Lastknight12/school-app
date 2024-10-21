import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addKlassSchema } from "~/schemas/zod";

import {
  adminProcerure,
  createTRPCRouter,
  teacherProcedure,
} from "~/server/api/trpc";

export const klassRouter = createTRPCRouter({
  getAllKlasses: adminProcerure.query(async ({ ctx }) => {
    return await ctx.db.klass.findMany({
      select: {
        name: true,
      },
    });
  }),

  getKlassStudents: adminProcerure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const klass = await ctx.db.klass.findFirst({
        where: {
          id: input.id,
        },
        select: {
          students: true,
        },
      });

      if (!klass?.students) {
        return [];
      }

      return klass.students;
    }),

  getAdminKlassData: adminProcerure
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

  getTeacherKlassData: teacherProcedure
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

  addKlass: adminProcerure
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
          teachers: {
            connect: input.teacherIds.map((id) => ({ id })),
          },
        },
      });
    }),

  addStudent: adminProcerure
    .input(z.object({ klassId: z.string(), studentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.klass.update({
        where: {
          id: input.klassId,
        },
        data: {
          students: {
            connect: {
              id: input.studentId,
            },
          },
        },
      });

      await ctx.db.user.update({
        where: {
          id: input.studentId,
        },
        data: {
          studentClass: {
            connect: {
              id: input.klassId,
            },
          },
        },
      });
    }),

  getKlassTeachers: adminProcerure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const klass = await ctx.db.klass.findUnique({
        where: {
          id: input.id,
        },
        select: {
          teachers: true,
        },
      });

      return klass?.teachers;
    }),

  addTeacher: adminProcerure
    .input(z.object({ klassId: z.string(), teacherId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.klass.update({
        where: {
          id: input.klassId,
        },
        data: {
          teachers: {
            connect: {
              id: input.teacherId,
            },
          },
        },
      });
    }),
});
