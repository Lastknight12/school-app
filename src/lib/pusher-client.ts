import Pusher from "pusher-js";

export const pusherClient = new Pusher(
  "b4e0e3f4c22b744cc197",
  {
    cluster: "eu",
  }
);