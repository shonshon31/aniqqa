"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { InformationCircleIcon, PlayIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/solid";
import type { AnimeSummary } from "@/types/anime";
import { useAppStore } from "@/store/useAppStore";
import { IconButton } from "@/components/IconButton";
import { safeImage } from "@/utils/format";

export function AnimeCard({ anime, priority = false }: { anime: AnimeSummary; priority?: boolean }) {
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = useAppStore((state) => state.isFavorite(anime.id));

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.035 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative min-w-40 overflow-hidden rounded-md bg-panel shadow-xl md:min-w-48"
    >
      <Link href={`/anime/${encodeURIComponent(anime.id)}`} aria-label={`Open ${anime.title}`} className="block">
        <div className="relative aspect-[2/3]">
          <Image
            src={anime.poster ?? safeImage(anime.title)}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 40vw, 192px"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />
        </div>
      </Link>

      <div className="absolute inset-x-0 bottom-0 translate-y-9 p-3 transition duration-300 group-hover:translate-y-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{anime.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-300">
          <span className="font-semibold text-gold">{anime.rating?.toFixed(1) ?? "7.8"}</span>
          <span>{anime.episodeCount ?? "??"} eps</span>
          <span className="capitalize">{anime.status ?? "unknown"}</span>
        </div>
        <div className="mt-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/watch/${encodeURIComponent(anime.id)}`}
            title="Play"
            aria-label={`Play ${anime.title}`}
            className="grid size-9 place-items-center rounded-full bg-white text-black transition hover:bg-brand hover:text-white"
          >
            <PlayIcon className="size-4" />
          </Link>
          <IconButton
            label={isFavorite ? "Remove from list" : "Add to list"}
            icon={isFavorite ? CheckIcon : PlusIcon}
            active={isFavorite}
            onClick={() => toggleFavorite(anime)}
            className="size-9"
          />
          <Link
            href={`/anime/${encodeURIComponent(anime.id)}`}
            title="More info"
            aria-label={`More info for ${anime.title}`}
            className="grid size-9 place-items-center rounded-full border border-white/20 bg-black/55 text-white transition hover:bg-white hover:text-black"
          >
            <InformationCircleIcon className="size-5" />
          </Link>
        </div>
        <p className="mt-2 line-clamp-1 text-[11px] text-zinc-400">{anime.genres.slice(0, 3).join(" • ") || "Anime"}</p>
      </div>
    </motion.article>
  );
}
