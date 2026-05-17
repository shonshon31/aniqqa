"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";
import type { AnimeSummary } from "@/types/anime";
import { AnimeCard } from "@/components/AnimeCard";

export function AnimeRow({ title, items }: { title: string; items: AnimeSummary[] }) {
  const ref = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  const scroll = (direction: -1 | 1) => {
    ref.current?.scrollBy({ left: direction * 720, behavior: "smooth" });
  };

  return (
    <section className="group py-5">
      <div className="mb-3 flex items-center justify-between px-5 md:px-10">
        <h2 className="text-lg font-semibold tracking-normal md:text-2xl">{title}</h2>
        <div className="hidden gap-2 md:flex">
          <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
            <ChevronLeftIcon className="size-5" />
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20">
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      </div>
      <div ref={ref} className="hide-scrollbar flex gap-3 overflow-x-auto px-5 pb-4 md:px-10">
        {items.map((anime, index) => (
          <AnimeCard key={`${anime.id}-${index}`} anime={anime} priority={index < 4} />
        ))}
      </div>
    </section>
  );
}
