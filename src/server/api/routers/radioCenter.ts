import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import { parse } from "node-html-parser";
import { z } from "zod";
import { env } from "~/env";

import {
  createTRPCRouter,
  protectedProcedure,
  radioCenterProcedure,
} from "../trpc";

// Used for validate music
const youtubeRegexp =
  /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

const soundcloudRegexp =
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;

export async function getYoutubeVideoInfo(videoId: string) {
  const yt = google.youtube({
    auth: env.YOUTUBE_API_KEY,
    version: "v3",
  });

  const response = await yt.videos.list({
    id: [videoId],
    part: ["statistics", "snippet", "contentDetails"],
  });

  if (
    !response.data.items ||
    response.data.items.length === 0 ||
    !response.data.items[0]?.snippet?.title ||
    !response.data.items[0]?.snippet.thumbnails?.maxres?.url
  ) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Відео не знайдено",
    });
  }

  return {
    musicTitle: response.data.items[0].snippet.title,
    musicImage: response.data.items[0].snippet.thumbnails.maxres.url,
  };
}

export async function getSoundcloudTrackInfo(trackUrl: string) {
  try {
    const response = await fetch(trackUrl).then((res) => res.text());

    const root = parse(response);

    const musicTitle = root
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content");
    const musicImage = root
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content");

    if (!musicTitle || !musicImage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Відео не знайдено",
      });
    }

    return {
      musicTitle,
      musicImage,
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Щось пішло не так, спробуйте пізніше",
    });
  }
}

export const radioCenterRouter = createTRPCRouter({
  getCurrentTrackAndQueue: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.db.musicOrder.findMany({
      where: {
        status: "ACCEPTED",
      },
      // limit orders
      take: 10,
      select: {
        id: true,
        status: true,
        musicUrl: true,
        musicTitle: true,
        musicImage: true,
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });

    const currentTrack = orders.shift();

    return {
      playerQueue: orders,
      currentTrack,
    };
  }),

  getOrders: radioCenterProcedure.query(async ({ ctx }) => {
    return await ctx.db.musicOrder.findMany({
      where: {
        status: "DELIVERED",
      },
      // limit orders
      take: 10,
      select: {
        id: true,
        status: true,
        musicUrl: true,
        musicTitle: true,
        musicImage: true,
        buyer: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  getVideoInfo: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {

      if (!youtubeRegexp.test(input) && !soundcloudRegexp.test(input)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Невірний URL",
        });
      }
      const videoType = youtubeRegexp.test(input) ? "youtube" : "soundcloud";

      let videoInfo;

      switch (videoType) {
        case "youtube":
          const videoId = input.replace(youtubeRegexp, "$2");
          videoInfo = await getYoutubeVideoInfo(videoId);
          break;

        case "soundcloud":
          videoInfo = await getSoundcloudTrackInfo(input);
          break;
      }

      return videoInfo;
    }),

  createOrder: protectedProcedure
    .input(
      z.object({
        musicUrl: z.string(),
        musicImage: z.string(),
        musicTitle: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!youtubeRegexp.test(input.musicUrl) && !soundcloudRegexp.test(input.musicUrl)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Невірний URL",
        });
      }

      const userOrders = await ctx.db.musicOrder.findMany({
        where: {
          buyer: {
            id: ctx.session?.user?.id,
          },
        },
      });

      if (userOrders.length >= 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ви не можете створювати більше 4 замовлень на день",
        });
      }

      const order = await ctx.db.musicOrder.create({
        data: {
          buyer: {
            connect: {
              id: ctx.session?.user?.id,
            },
          },
          musicUrl: input.musicUrl,
          musicTitle: input.musicTitle,
          musicImage: input.musicImage,
        },
        select: {
          id: true,
          musicUrl: true,
          musicImage: true,
          musicTitle: true,
          buyer: {
            select: {
              name: true,
            },
          },
          status: true,
        },
      });

      await ctx.pusher.trigger("radioCenter", "order-created", order);
    }),

  deleteOrder: radioCenterProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.musicOrder.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.pusher.trigger("radioCenter", "refresh", null);
    }),

  acceptOrder: radioCenterProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.musicOrder.update({
        where: {
          id: input.id,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      await ctx.pusher.trigger("radioCenter_client", "add-track", order);
      await ctx.pusher.trigger("radioCenter", "refresh", null);
    }),

  cancelOrder: radioCenterProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.musicOrder.update({
        where: {
          id: input.id,
        },
        data: {
          status: "CANCELLED",
        },
        select: {
          id: true,
          musicImage: true,
          buyer: {
            select: {
              id: true,
              name: true,
            },
          },
          status: true,
        },
      });

      await ctx.pusher.trigger("radioCenter", "refresh", order);
    }),
});
