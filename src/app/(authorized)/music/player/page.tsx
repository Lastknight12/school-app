"use client";

import { type MusicOrder } from "@prisma/client";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { api } from "~/trpc/react";

import { socket } from "~/lib/socket";

type Track = Omit<MusicOrder, "createdAt" | "buyerId">;

export default function Player() {
  const [tracks, addTracks] = useState<Track[] | undefined>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>();

  const [userInteraction, setUserInteracted] = useState(false);

  const youtubeRegexp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const soundcloudRegexp =
    /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/;

  const getTracks = api.radioCenter.getCurrentTrackAndQueue.useQuery();

  const deleteTrack = api.radioCenter.deleteOrder.useMutation({
    onSuccess: () => {
      socket.emit("refresh");
    },
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (getTracks.data) {
      getTracks.data.playerQueue &&
        addTracks(getTracks.data.playerQueue.map((item) => item));
      getTracks.data.currentTrack &&
        setCurrentTrack(getTracks.data.currentTrack);
    }
  }, [getTracks.data]);

  useEffect(() => {
    // const pusherChannel = pusherClient.subscribe("radioCenter_client");
    socket.emit("joinRoom", { roomId: "radioCenter-client" });

    socket.on("add-track", (data: MusicOrder) => {
      console.log(data);
      handleAddTrack(data);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [handleAddTrack]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentTrack) {
        localStorage.setItem("lastTrack", currentTrack.id);
      }
    };

    if (currentTrack) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, tracks]);

  function handleAddTrack(track: Track) {
    if (
      !youtubeRegexp.test(track.musicUrl) &&
      !soundcloudRegexp.test(track.musicUrl)
    ) {
      return;
    }

    if (!currentTrack && tracks?.length === 0) {
      setCurrentTrack(track);
    } else {
      addTracks((prev) => [...prev!.map((item) => item), track]);
    }
  }

  function handleTrackEnd() {
    const nextTrack = tracks ? tracks.shift() : undefined;

    setCurrentTrack(nextTrack);
    deleteTrack.mutate({ id: currentTrack!.id });
  }

  if (!userInteraction) {
    return (
      <button
        className="w-screen h-full_page flex items-center justify-center"
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
    <div className="px-6">
      {!currentTrack && <h1>Немає жодного треку в черзі</h1>}

      <div className="mb-4">
        {currentTrack && (
          <ReactPlayer
            playing={true}
            controls={true}
            onEnded={handleTrackEnd}
            url={currentTrack.musicUrl}
          />
        )}
      </div>

      <h1 className="mb-3">Наступні треки:</h1>
      <div className="flex flex-col gap-w">
        {!tracks ||
          (tracks.length === 0 && (
            <h1 className="font-bold">Немає наступних треків</h1>
          ))}

        {tracks?.map((track, index) => (
          <div key={index} className="font-bold">
            {track.musicTitle}
          </div>
        ))}
      </div>
    </div>
  );
}
