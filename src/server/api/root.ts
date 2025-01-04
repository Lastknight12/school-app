import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { categoryRouter } from "./routers/category";
import { kaznaRouter } from "./routers/kazna";
import { klassRouter } from "./routers/klass";
import { radioCenterRouter } from "./routers/radioCenter";
import { transfersRouter } from "./routers/transfers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  transfers: transfersRouter,
  klass: klassRouter,
  category: categoryRouter,
  radioCenter: radioCenterRouter,
  kazna: kaznaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
