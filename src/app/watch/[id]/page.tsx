import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { WatchExperience } from "@/components/WatchExperience";
import { getAnimeDetails } from "@/services/anikoto";

export default async function WatchPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ episode?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const anime = await getAnimeDetails(id);
  const episodeNumber = Number(query.episode ?? 1);
  const episodes = anime.episodes.length ? anime.episodes : [{ id: "1", number: 1, title: "Episode 1", embedUrl: {} }];
  const episode = episodes.find((item) => item.number === episodeNumber) ?? episodes[0];
  const nextEpisode = episodes.find((item) => item.number === episode.number + 1);

  return (
    <main className="min-h-screen bg-ink">
      <Navbar />
      <div className="px-0 pt-20">
        <WatchExperience anime={anime} episode={episode} nextEpisode={nextEpisode} />
      </div>
      <section className="grid gap-8 px-5 py-8 md:grid-cols-[1fr_360px] md:px-10">
        <div>
          <p className="text-sm font-semibold uppercase text-brand">Episode {episode.number}</p>
          <h1 className="mt-2 text-3xl font-black">{anime.title}</h1>
          <h2 className="mt-1 text-xl text-zinc-300">{episode.title}</h2>
          <p className="mt-4 max-w-3xl leading-7 text-zinc-300">{episode.synopsis ?? anime.synopsis}</p>
        </div>
        <aside className="glass max-h-[70vh] overflow-y-auto rounded-md p-3">
          <h2 className="mb-3 px-2 text-lg font-bold">Episodes</h2>
          <div className="space-y-2">
            {episodes.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${encodeURIComponent(anime.id)}?episode=${item.number}`}
                className={`block rounded px-3 py-3 text-sm transition ${item.id === episode.id ? "bg-brand text-white" : "hover:bg-white/10"}`}
              >
                <span className="font-bold">E{item.number}</span> {item.title}
              </Link>
            ))}
          </div>
          {nextEpisode && (
            <Link href={`/watch/${encodeURIComponent(anime.id)}?episode=${nextEpisode.number}`} className="mt-4 block rounded bg-white px-3 py-3 text-center font-bold text-black">
              Auto-next target: E{nextEpisode.number}
            </Link>
          )}
        </aside>
      </section>
    </main>
  );
}
