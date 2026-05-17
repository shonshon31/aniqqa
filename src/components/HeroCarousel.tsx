"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { InformationCircleIcon, PlayIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";
import type { AnimeSummary } from "@/types/anime";
import { useAppStore } from "@/store/useAppStore";
import { safeImage } from "@/utils/format";

export function HeroCarousel({ items }: { items: AnimeSummary[] }) {
  const [index, setIndex] = useState(0);
  const featured = useMemo(() => items.slice(0, 5), [items]);
  const active = featured[index] ?? items[0];
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = window.setInterval(() => setIndex((value) => (value + 1) % featured.length), 6500);
    return () => window.clearInterval(interval);
  }, [featured.length]);

  if (!active) return null;

  return (
    <section className="relative min-h-[76vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
          className="absolute inset-0"
        >
          <Image src={active.cover ?? safeImage(active.title, "banner")} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-cinema-fade" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-bottom-fade" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[76vh] max-w-4xl flex-col justify-end px-5 pb-24 pt-28 md:px-10 lg:pb-28">
        <p className="mb-3 text-sm font-semibold uppercase text-brand">Now streaming</p>
        <h1 className="max-w-3xl text-4xl font-black tracking-normal text-white md:text-7xl">{active.title}</h1>
        <p className="mt-4 line-clamp-3 max-w-2xl text-base leading-7 text-zinc-200 md:text-lg">{active.synopsis}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
          <span className="font-bold text-gold">{active.rating?.toFixed(1) ?? "8.0"} rating</span>
          <span>{active.episodeCount ?? "New"} episodes</span>
          <span className="capitalize">{active.status ?? "available"}</span>
          <span>{active.genres.slice(0, 3).join(" • ")}</span>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/watch/${encodeURIComponent(active.id)}`} className="inline-flex items-center gap-2 rounded bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200">
            <PlayIcon className="size-5" />
            Play
          </Link>
          <button type="button" onClick={() => toggleFavorite(active)} className="inline-flex items-center gap-2 rounded bg-white/15 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/25">
            <PlusIcon className="size-5" />
            My List
          </button>
          <Link href={`/anime/${encodeURIComponent(active.id)}`} className="inline-flex items-center gap-2 rounded bg-white/15 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/25">
            <InformationCircleIcon className="size-5" />
            Details
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 right-5 z-20 flex gap-2 md:right-10">
        {featured.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show ${item.title}`}
            onClick={() => setIndex(dotIndex)}
            className={`h-1.5 rounded-full transition ${index === dotIndex ? "w-10 bg-brand" : "w-5 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
