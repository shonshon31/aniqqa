"use client";

import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import { Navbar } from "@/components/Navbar";
import { useAppStore } from "@/store/useAppStore";

export default function MyListPage() {
  const favorites = useAppStore((state) => state.favorites);
  const user = useAppStore((state) => state.user);

  return (
    <main className="min-h-screen bg-ink pb-20">
      <Navbar />
      <section className="px-5 pt-28 md:px-10">
        <h1 className="text-4xl font-black md:text-6xl">My List</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">{user ? `Saved for ${user.name}.` : "Sign in or continue as guest to persist your list on this device."}</p>
      </section>
      <ContinueWatching />
      {favorites.length ? (
        <AnimeRow title="Favorites" items={favorites} />
      ) : (
        <section className="px-5 py-10 md:px-10">
          <div className="glass rounded-md p-8 text-zinc-300">Your favorites will appear here after you add anime from any card or details page.</div>
        </section>
      )}
    </main>
  );
}
