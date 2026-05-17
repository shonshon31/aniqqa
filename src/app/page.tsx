import { AnimeRow } from "@/components/AnimeRow";
import { ContinueWatching } from "@/components/ContinueWatching";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Navbar } from "@/components/Navbar";
import { getRecentAnime } from "@/services/anikoto";
import type { AnimeSummary } from "@/types/anime";

export default async function HomePage() {
  const recent = await getRecentAnime(1, 36).catch(() => ({ items: [], pagination: { page: 1, perPage: 36, hasNextPage: false } }));
  const items = recent.items;
  const topRated = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const popular = items.filter((_, index) => index % 2 === 0);
  const recommended = items.filter((_, index) => index % 3 !== 0);
  const genres = groupByGenre(items);

  return (
    <main className="min-h-screen bg-ink pb-16">
      <Navbar />
      <HeroCarousel items={items} />
      <ContinueWatching />
      <AnimeRow title="Trending Anime" items={items.slice(0, 18)} />
      <AnimeRow title="Popular on aniqqa" items={popular.slice(0, 18)} />
      <AnimeRow title="Recently Updated" items={items.slice(6, 24)} />
      <AnimeRow title="Top Rated" items={topRated.slice(0, 18)} />
      <AnimeRow title="Recommended for You" items={recommended.slice(0, 18)} />
      {genres.map(([genre, anime]) => (
        <AnimeRow key={genre} title={genre} items={anime} />
      ))}
    </main>
  );
}

function groupByGenre(items: AnimeSummary[]) {
  const map = new Map<string, AnimeSummary[]>();
  items.forEach((item) => {
    item.genres.slice(0, 2).forEach((genre) => {
      map.set(genre, [...(map.get(genre) ?? []), item]);
    });
  });
  return Array.from(map.entries()).filter(([, anime]) => anime.length >= 4).slice(0, 6);
}
