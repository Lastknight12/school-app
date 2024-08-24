import { z } from "zod";
import {
  adminProcerure,
  createTRPCRouter,
  teacherProcerure,
} from "~/server/api/trpc";

export const klassRouter = createTRPCRouter({
  getKlass: teacherProcerure.query(async ({ ctx }) => {
    const klass = await ctx.db.klass.findFirst({
      where: {
        OR: [
          { teacherId: ctx.session.user.id },
          { students: { some: { id: ctx.session.user.id } } },
        ],
      },
      select: {
        name: true,
        teacherId: true,
        students: true,
      },
    });

    return klass;
  }),
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
          teacher: true,
          students: true,
        },
      });
    }),

  addKlass: adminProcerure
    .input(z.object({ name: z.string(), teacherId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const klass = await ctx.db.klass.create({
        data: {
          name: input.name,
          teacher: {
            connect: {
              id: input.teacherId,
            },
          },
        },
      });

      await ctx.db.user.update({
        where: {
          id: input.teacherId,
        },
        data: {
          teacherIn: {
            connect: {
              id: klass.id,
            },
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
          studentIn: {
            connect: {
              id: input.klassId,
            },
          },
        },
      });
    }),
});
