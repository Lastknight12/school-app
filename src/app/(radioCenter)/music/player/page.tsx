"use client";

import { type Channel } from "pusher-js";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { pusherClient } from "~/lib/pusher-client";

export default function Player() {
  const [tracks, addTracks] = useState<string[]>([]);
  const [currentTrackSrc, setCurrentTrackSrc] = useState("");
  const [channel, setChannel] = useState<Channel | null>(null);

  const [userInteraction, setUserInteracted] = useState(false);

  const youtubeRegexp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const soundcloudRegexp =
    /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;

  console.log(currentTrackSrc);
  function handleAddTrack(data: string) {
    if (!youtubeRegexp.test(data) && !soundcloudRegexp.test(data)) {
      return;
    }

    if (!currentTrackSrc && tracks.length === 0) {
      setCurrentTrackSrc(data);
    } else {
      addTracks((prev) => [...prev, data]);
    }
  }

  useEffect(() => {
    const pusherChannel = pusherClient.subscribe("radioCenter_client");
    setChannel(pusherChannel);

    return () => {
      pusherClient.unsubscribe("radioCenter_client");
      pusherClient.unbind_all();
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (channel && channel.bind) {
      channel.bind("add-track", function (data: string) {
        handleAddTrack(data);
      });

      return () => {
        channel.unbind_all();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, currentTrackSrc, tracks]);

  if (!userInteraction) {
    return (
      <button
        className="w-screen h-screen flex items-center justify-center"
        onClick={() => setUserInteracted(true)}
      >
        <p>
          Клацніть щоб продовжити. Це необхідно для автоматичного відтворення
          аудіо
        </p>
      </button>
    );
  }

  return (
    <>
      {!currentTrackSrc && <h1>Немає жодного треку в черзі</h1>}

      {currentTrackSrc && (
        <ReactPlayer
          playing={true}
          controls={true}
          onEnded={() => {
            if (tracks.length > 0) {
              setCurrentTrackSrc(tracks.shift()!);
            } else {
              setCurrentTrackSrc("");
            }
          }}
          url={currentTrackSrc}
        />
      )}

      <h1>Track queue</h1>
      {tracks.length === 0 && <h1>Черга пуста</h1>}
      {tracks.map((track, index) => (
        <div key={index}>{track}</div>
      ))}
    </>
  );
}
