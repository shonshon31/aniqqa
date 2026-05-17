import type { AnimeDetails, PaginatedAnime } from "@/types/anime";

export async function getClientAnime(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });

  const response = await fetch(`/api/anime?${search.toString()}`);
  if (!response.ok) throw new Error("Unable to load anime");
  return (await response.json()) as PaginatedAnime;
}

export async function getClientAnimeDetails(id: string) {
  const response = await fetch(`/api/anime/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("Unable to load anime details");
  return (await response.json()) as AnimeDetails;
}

export async function getClientGenres() {
  const response = await fetch("/api/genres");
  if (!response.ok) return [];
  const data = (await response.json()) as { genres: string[] };
  return data.genres;
}
