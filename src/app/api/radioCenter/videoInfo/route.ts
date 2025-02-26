import { google } from "googleapis";
import { type NextRequest } from "next/server";
import parse from "node-html-parser";
import { z } from "zod";
import { env } from "~/env";

import { ServerError, getReqBody, withAuth } from "~/lib/server";

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
    throw new ServerError({
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
      throw new ServerError({
        code: "NOT_FOUND",
        message: "Відео не знайдено",
      });
    }

    return {
      musicTitle,
      musicImage,
    };
  } catch (error) {
    throw new ServerError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Щось пішло не так, спробуйте пізніше",
    });
  }
}

export const getVideoInfoInput = z.object({ url: z.string() });

export async function getVideoInfoHandler(req: NextRequest) {
  const input = await getReqBody(req, getVideoInfoInput);

  if (!input.success) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: JSON.stringify(input.error.issues),
      cause: "TypeError",
    });
  }

  if (
    !youtubeRegexp.test(input.data.url) &&
    !soundcloudRegexp.test(input.data.url)
  ) {
    throw new ServerError({
      code: "BAD_REQUEST",
      message: "Невірний URL",
    });
  }
  const videoType = youtubeRegexp.test(input.data.url)
    ? "youtube"
    : "soundcloud";

  let videoInfo;

  switch (videoType) {
    case "youtube":
      const videoId = input.data.url.replace(youtubeRegexp, "$2");
      videoInfo = await getYoutubeVideoInfo(videoId);
      break;

    case "soundcloud":
      videoInfo = await getSoundcloudTrackInfo(input.data.url);
      break;
  }

  return videoInfo;
}

export async function POST(req: NextRequest) {
  return withAuth(req, getVideoInfoHandler);
}
