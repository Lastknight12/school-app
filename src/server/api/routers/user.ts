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
    return await ctx.db.user.findMany({});
  }),
});
