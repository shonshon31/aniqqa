"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimeCard } from "@/components/AnimeCard";
import { Navbar } from "@/components/Navbar";
import { RowSkeleton } from "@/components/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getClientAnime, getClientGenres } from "@/services/client";
import type { AnimeSummary } from "@/types/anime";

export function SearchClient({ initialGenre = "" }: { initialGenre?: string }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState(initialGenre);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AnimeSummary[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const debounced = useDebouncedValue(query, 300);

  useEffect(() => {
    void getClientGenres().then(setGenres);
  }, []);

  useEffect(() => {
    setLoading(true);
    void getClientAnime({ q: debounced, genre, status, sort, page, perPage: 48 })
      .then((data) => setItems((previous) => (page === 1 ? data.items : [...previous, ...data.items])))
      .finally(() => setLoading(false));
  }, [debounced, genre, page, sort, status]);

  useEffect(() => {
    setPage(1);
  }, [debounced, genre, sort, status]);

  const controls = useMemo(() => (
    <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_160px]">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anime, genre, status..." className="rounded bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500" />
      <select value={genre} onChange={(event) => setGenre(event.target.value)} className="rounded bg-white/10 px-4 py-3">
        <option value="">All genres</option>
        {genres.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded bg-white/10 px-4 py-3">
        <option value="">Any status</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
        <option value="upcoming">Upcoming</option>
      </select>
      <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded bg-white/10 px-4 py-3">
        <option value="popular">Popular</option>
        <option value="rating">Top rated</option>
        <option value="year">Newest</option>
      </select>
    </div>
  ), [genre, genres, query, sort, status]);

  return (
    <main className="min-h-screen bg-ink pb-20">
      <Navbar />
      <section className="px-5 pt-28 md:px-10">
        <h1 className="text-4xl font-black md:text-6xl">Browse anime</h1>
        <div className="mt-6">{controls}</div>
      </section>

      <section className="px-5 py-8 md:px-10">
        {loading && page === 1 ? (
          <RowSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {items.map((anime, index) => <AnimeCard key={`${anime.id}-${index}`} anime={anime} />)}
          </div>
        )}
        <div className="mt-8 grid place-items-center">
          <button type="button" onClick={() => setPage((value) => value + 1)} className="rounded bg-white px-5 py-3 font-bold text-black hover:bg-zinc-200">
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      </section>
    </main>
  );
}
