import { type NextRequest } from "next/server";
import { z } from "zod";

import { type CustomUser } from "~/server/auth";
import { db } from "~/server/db";

import { pusher } from "~/lib/pusher-server";
import { ServerError, getReqBody, withAuth } from "~/lib/server";

const youtubeRegexp =
  /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

const soundcloudRegexp =
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;

export const createOrderInput = z.object({
  musicUrl: z.string(),
  musicImage: z.string(),
  musicTitle: z.string(),
});

export async function createOrderHandler(
  req: NextRequest,
  session: CustomUser,
) {
  const input = await getReqBody(req, createOrderInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (
    !youtubeRegexp.test(input.data.musicUrl) &&
    !soundcloudRegexp.test(input.data.musicUrl)
  ) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Невірний URL",
    });
  }

  const userOrders = await db.musicOrder.findMany({
    where: {
      buyer: {
        id: session.id,
      },
    },
  });

  if (userOrders.length >= 4) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Ви не можете створювати більше 4 замовлень на день",
    });
  }

  const order = await db.musicOrder.create({
    data: {
      buyer: {
        connect: {
          id: session.id,
        },
      },
      musicUrl: input.data.musicUrl,
      musicTitle: input.data.musicTitle,
      musicImage: input.data.musicImage,
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

  await pusher.trigger("radioCenter", "order-created", order);
}

export async function POST(req: NextRequest) {
  return withAuth(req, createOrderHandler, ["STUDENT", "RADIO_CENTER"]);
}
