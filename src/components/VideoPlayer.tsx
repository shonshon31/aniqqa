"use client";

import Hls from "hls.js";
import { ForwardIcon, SpeakerWaveIcon, TvIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AnimeDetails, Episode } from "@/types/anime";
import { useAppStore } from "@/store/useAppStore";
import { clamp } from "@/utils/format";

type Props = {
  anime: AnimeDetails;
  episode: Episode;
  onNext?: () => void;
};

export function VideoPlayer({ anime, episode, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveProgress = useAppStore((state) => state.saveProgress);
  const theaterMode = useAppStore((state) => state.theaterMode);
  const setTheaterMode = useAppStore((state) => state.setTheaterMode);
  const storedProgress = useAppStore((state) => state.progress.find((item) => item.episodeId === episode.id));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [showSkip, setShowSkip] = useState(true);

  const source = useMemo(() => episode.sources?.find((item) => item.type === "hls")?.url, [episode.sources]);
  const embed = episode.embedUrl?.sub ?? episode.embedUrl?.dub;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    let hls: Hls | undefined;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    }

    const resume = storedProgress?.timestamp;
    if (resume && resume > 10) video.currentTime = resume;
    return () => hls?.destroy();
  }, [source, storedProgress?.timestamp]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handler = () => {
      saveProgress({
        animeId: anime.id,
        episodeId: episode.id,
        animeTitle: anime.title,
        episodeTitle: episode.title,
        poster: anime.poster,
        timestamp: video.currentTime,
        duration: video.duration || storedProgress?.duration || 0,
        updatedAt: new Date().toISOString()
      });
    };

    const timer = window.setInterval(handler, 5000);
    video.addEventListener("ended", () => onNext?.());
    return () => window.clearInterval(timer);
  }, [anime, episode, onNext, saveProgress, storedProgress?.duration]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const video = videoRef.current;
      if (!video) return;
      if (event.key === " ") {
        event.preventDefault();
        playing ? video.pause() : void video.play();
      }
      if (event.key === "ArrowRight") video.currentTime += 10;
      if (event.key === "ArrowLeft") video.currentTime = clamp(video.currentTime - 10, 0, video.duration || 0);
      if (event.key.toLowerCase() === "f") void containerRef.current?.requestFullscreen();
      if (event.key.toLowerCase() === "t") setTheaterMode(!theaterMode);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playing, setTheaterMode, theaterMode]);

  if (!source && embed) {
    return (
      <div ref={containerRef} className={theaterMode ? "fixed inset-0 z-50 bg-black" : "relative aspect-video bg-black"}>
        <iframe src={embed} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="size-full border-0" title={`${anime.title} ${episode.title}`} />
        <PlayerChrome
          speed={speed}
          quality={quality}
          setSpeed={setSpeed}
          setQuality={setQuality}
          theaterMode={theaterMode}
          setTheaterMode={setTheaterMode}
          onNext={onNext}
          showSkip={showSkip}
          setShowSkip={setShowSkip}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={theaterMode ? "fixed inset-0 z-50 bg-black" : "relative aspect-video bg-black"}>
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay
        poster={episode.thumbnail ?? anime.cover ?? anime.poster}
        className="size-full"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {episode.subtitles?.map((subtitle) => (
          <track key={subtitle.url} src={subtitle.url} kind="subtitles" srcLang={subtitle.lang} label={subtitle.label} default={subtitle.default} />
        ))}
      </video>
      <PlayerChrome
        speed={speed}
        quality={quality}
        setSpeed={setSpeed}
        setQuality={setQuality}
        theaterMode={theaterMode}
        setTheaterMode={setTheaterMode}
        onNext={onNext}
        showSkip={showSkip}
        setShowSkip={setShowSkip}
      />
    </div>
  );
}

function PlayerChrome(props: {
  speed: number;
  quality: string;
  theaterMode: boolean;
  showSkip: boolean;
  setSpeed: (value: number) => void;
  setQuality: (value: string) => void;
  setTheaterMode: (value: boolean) => void;
  setShowSkip: (value: boolean) => void;
  onNext?: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-black/90 to-transparent p-4">
      <div className="pointer-events-auto flex flex-wrap items-center gap-2">
        {props.showSkip && (
          <button type="button" onClick={() => props.setShowSkip(false)} className="rounded bg-white px-3 py-2 text-sm font-bold text-black">
            Skip intro
          </button>
        )}
        <button type="button" onClick={props.onNext} className="inline-flex items-center gap-2 rounded bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25">
          <ForwardIcon className="size-4" />
          Next
        </button>
      </div>
      <div className="pointer-events-auto flex flex-wrap items-center gap-2 text-sm">
        <SpeakerWaveIcon className="size-4 text-zinc-300" />
        <select value={props.quality} onChange={(event) => props.setQuality(event.target.value)} className="rounded bg-black/70 px-2 py-2">
          <option value="auto">Auto</option>
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
        </select>
        <select value={props.speed} onChange={(event) => props.setSpeed(Number(event.target.value))} className="rounded bg-black/70 px-2 py-2">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
            <option key={value} value={value}>{value}x</option>
          ))}
        </select>
        <button type="button" onClick={() => props.setTheaterMode(!props.theaterMode)} className="grid size-9 place-items-center rounded bg-black/70 hover:bg-white/20" aria-label="Theater mode">
          <TvIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
