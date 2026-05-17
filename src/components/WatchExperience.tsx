"use client";

import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { AnimeDetails, Episode } from "@/types/anime";

export function WatchExperience({ anime, episode, nextEpisode }: { anime: AnimeDetails; episode: Episode; nextEpisode?: Episode }) {
  const router = useRouter();
  const goNext = () => {
    if (nextEpisode) router.push(`/watch/${encodeURIComponent(anime.id)}?episode=${nextEpisode.number}`);
  };

  return <VideoPlayer anime={anime} episode={episode} onNext={nextEpisode ? goNext : undefined} />;
}
