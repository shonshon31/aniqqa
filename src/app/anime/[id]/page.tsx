import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";
import { AnimeRow } from "@/components/AnimeRow";
import { Navbar } from "@/components/Navbar";
import { getAnimeDetails } from "@/services/anikoto";
import { safeImage, titleCase } from "@/utils/format";

export default async function AnimeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anime = await getAnimeDetails(id);

  return (
    <main className="min-h-screen bg-ink pb-20">
      <Navbar />
      <section className="relative min-h-[72vh] overflow-hidden">
        <Image src={anime.banner ?? anime.cover ?? safeImage(anime.title, "banner")} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-cinema-fade" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-bottom-fade" />
        <div className="relative z-10 flex min-h-[72vh] max-w-5xl flex-col justify-end px-5 pb-16 pt-28 md:px-10">
          <h1 className="text-4xl font-black md:text-7xl">{anime.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-300">
            <span className="font-bold text-gold">{anime.rating?.toFixed(1)} rating</span>
            <span>{anime.year ?? "Latest"}</span>
            <span>{anime.episodeCount ?? anime.episodes.length} episodes</span>
            <span className="capitalize">{titleCase(anime.status ?? "unknown")}</span>
          </div>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-200 md:text-lg">{anime.synopsis}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/watch/${encodeURIComponent(anime.id)}`} className="inline-flex items-center gap-2 rounded bg-white px-5 py-3 font-bold text-black hover:bg-zinc-200">
              <PlayIcon className="size-5" />
              Start Watching
            </Link>
            {anime.trailer && (
              <a href={anime.trailer} target="_blank" rel="noreferrer" className="rounded bg-white/15 px-5 py-3 font-bold text-white hover:bg-white/25">
                Trailer
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-10">
        <div className="flex flex-wrap gap-2">
          {anime.genres.map((genre) => (
            <Link key={genre} href={`/search?genre=${encodeURIComponent(genre)}`} className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-300 hover:bg-white/10">
              {genre}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 md:px-10">
        <h2 className="mb-4 text-2xl font-bold">Episodes</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(anime.episodes.length ? anime.episodes : fallbackEpisodes()).map((episode) => (
            <Link key={episode.id} href={`/watch/${encodeURIComponent(anime.id)}?episode=${episode.number}`} className="glass flex items-center gap-4 rounded-md p-3 transition hover:bg-white/10">
              <div className="grid size-12 shrink-0 place-items-center rounded bg-white/10 font-bold">{episode.number}</div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{episode.title}</h3>
                <p className="line-clamp-1 text-sm text-zinc-400">{episode.synopsis ?? "Stream with subtitles and resume support when available."}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <AnimeRow title="Related Anime" items={anime.related} />
      <AnimeRow title="Recommendations" items={anime.recommendations} />
    </main>
  );
}

function fallbackEpisodes() {
  return Array.from({ length: 12 }).map((_, index) => ({
    id: String(index + 1),
    number: index + 1,
    title: `Episode ${index + 1}`,
    synopsis: "Episode metadata appears when AnimeKoto provides it."
  }));
}
