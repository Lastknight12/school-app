import Pusher from "pusher-js";

export const pusherClient = new Pusher(
  "a56a4ad70d0ff0245743",
  {
    cluster: "eu",
  }
);