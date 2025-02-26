import Pusher from "pusher-js";
import { env } from "~/env";

export const pusherClient = new Pusher(
  env.PUSHER_KEY,
  {
    cluster: "eu",
  }
);
