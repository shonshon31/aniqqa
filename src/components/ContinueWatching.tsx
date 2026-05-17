"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";

export function ContinueWatching() {
  const progress = useAppStore((state) => state.progress);
  if (!progress.length) return null;

  return (
    <section className="px-5 py-5 md:px-10">
      <h2 className="mb-3 text-lg font-semibold md:text-2xl">Continue Watching</h2>
      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-4">
        {progress.slice(0, 12).map((item) => {
          const percent = item.duration ? Math.min(100, Math.round((item.timestamp / item.duration) * 100)) : 15;
          return (
            <Link key={item.episodeId} href={`/watch/${encodeURIComponent(item.animeId)}?episode=${encodeURIComponent(item.episodeId)}`} className="glass min-w-72 overflow-hidden rounded-md">
              <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${item.poster ?? ""})` }} />
              <div className="p-3">
                <h3 className="line-clamp-1 font-semibold">{item.animeTitle}</h3>
                <p className="line-clamp-1 text-sm text-zinc-400">{item.episodeTitle}</p>
                <div className="mt-3 h-1 rounded bg-white/10">
                  <div className="h-full rounded bg-brand" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
