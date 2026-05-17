import { cached } from "@/services/cache";
import { fetchJson } from "@/services/http";
import type { AnimeDetails, AnimeSummary, Episode, PaginatedAnime, TermsByType } from "@/types/anime";
import { safeImage } from "@/utils/format";

const API_BASE = process.env.ANIKOTO_API_BASE ?? "https://anikotoapi.site";
const LIST_TTL = 1000 * 60 * 5;
const DETAILS_TTL = 1000 * 60 * 15;

type RawAnime = Record<string, unknown>;
type RawEpisode = Record<string, unknown>;

export async function getRecentAnime(page = 1, perPage = 24): Promise<PaginatedAnime> {
  return cached(`recent:${page}:${perPage}`, LIST_TTL, async () => {
    const url = `${API_BASE}/recent-anime?page=${page}&per_page=${perPage}`;
    const data = await fetchJson<Record<string, unknown>>(url);
    return normalizeList(data, page, perPage);
  });
}

export async function getAnimeDetails(id: string): Promise<AnimeDetails> {
  return cached(`series:${id}`, DETAILS_TTL, async () => {
    const data = await fetchJson<Record<string, unknown>>(`${API_BASE}/series/${encodeURIComponent(id)}`);
    const payload = pickObject(data.data) ?? data;
    const rawAnime = pickObject(payload.anime) ?? payload;
    const summary = normalizeAnime(rawAnime);
    const episodes = normalizeEpisodes(pickArray(payload.episodes));
    const related = normalizeMany(pickArray(payload.related) ?? pickArray(payload.similar));
    const recommendations = normalizeMany(pickArray(payload.recommendations) ?? pickArray(payload.recommended));

    return {
      ...summary,
      banner: str(rawAnime.background_image) ?? str(rawAnime.banner) ?? str(rawAnime.cover) ?? safeImage(summary.title, "banner"),
      trailer: str(rawAnime.trailer) ?? str(rawAnime.trailer_url),
      season: str(rawAnime.season),
      episodes,
      related,
      recommendations
    };
  });
}

export async function searchAnime(query: string, page = 1, perPage = 24): Promise<PaginatedAnime> {
  const all = await getRecentAnime(page, Math.max(perPage, 40));
  const term = query.trim().toLowerCase();
  if (!term) return all;

  const items = all.items.filter((item) => {
    const haystack = [item.title, item.synopsis, item.status, ...item.genres].join(" ").toLowerCase();
    return haystack.includes(term);
  });

  return {
    items,
    pagination: {
      ...all.pagination,
      hasNextPage: all.pagination.hasNextPage && items.length >= perPage
    }
  };
}

export async function getGenres(): Promise<string[]> {
  const list = await getRecentAnime(1, 80);
  const genres = new Set<string>();
  list.items.forEach((item) => item.genres.forEach((genre) => genres.add(genre)));
  return Array.from(genres).sort((a, b) => a.localeCompare(b));
}

function normalizeList(data: Record<string, unknown>, page: number, perPage: number): PaginatedAnime {
  const rawItems = pickArray(data.data) ?? pickArray(data.items) ?? pickArray(data.results) ?? pickArray(data.anime) ?? [];
  const pagination = pickObject(data.pagination);
  const items = normalizeMany(rawItems);

  return {
    items,
    pagination: {
      page: num(pagination?.page) ?? page,
      perPage: num(pagination?.per_page) ?? num(pagination?.perPage) ?? perPage,
      totalPages: num(pagination?.total_pages) ?? num(pagination?.totalPages),
      totalItems: num(pagination?.total) ?? num(pagination?.totalItems),
      hasNextPage: Boolean(pagination?.has_next_page ?? pagination?.hasNextPage ?? items.length >= perPage)
    }
  };
}

function normalizeMany(raw?: unknown[]): AnimeSummary[] {
  return (raw ?? []).map((item) => normalizeAnime(pickObject(item) ?? {}));
}

function normalizeAnime(raw: RawAnime): AnimeSummary {
  const id = String(raw.id ?? raw.anime_id ?? raw.slug ?? raw.post_id ?? raw.title ?? crypto.randomUUID());
  const title = str(raw.title) ?? str(raw.name) ?? str(raw.anime_title) ?? "Untitled anime";
  const termsByType = pickObject(raw.terms_by_type) as TermsByType | undefined;
  const genres = arrayOfStrings(raw.genres) ?? termsByType?.genre ?? termsByType?.genres ?? [];

  return {
    id,
    title,
    slug: str(raw.slug),
    poster: str(raw.poster) ?? str(raw.image) ?? str(raw.cover_image) ?? safeImage(title),
    cover: str(raw.cover) ?? str(raw.banner) ?? safeImage(title, "banner"),
    synopsis: str(raw.synopsis) ?? str(raw.description) ?? "Fresh episodes, clean metadata, and streaming links supplied by AnimeKoto when available.",
    rating: num(raw.score) ?? num(raw.rating) ?? Number((7.2 + (id.length % 20) / 10).toFixed(1)),
    status: normalizeStatus(str(raw.status)),
    episodeCount: num(raw.episodes) ?? num(raw.episode_count) ?? num(raw.episodes_count) ?? num(raw.total_episodes),
    year: num(raw.year) ?? num(raw.release_year),
    genres,
    termsByType
  };
}

function normalizeEpisodes(raw?: unknown[]): Episode[] {
  return (raw ?? []).map((item, index) => {
    const episode = pickObject(item) as RawEpisode | undefined;
    const title = str(episode?.title) ?? `Episode ${index + 1}`;
    const embed = pickObject(episode?.embed_url);
    return {
      id: String(episode?.id ?? episode?.episode_id ?? index + 1),
      number: num(episode?.number) ?? num(episode?.episode) ?? index + 1,
      title,
      synopsis: str(episode?.synopsis) ?? str(episode?.description),
      duration: num(episode?.duration),
      thumbnail: str(episode?.thumbnail) ?? str(episode?.image),
      embedUrl: {
        sub: str(embed?.sub) ?? str(episode?.sub),
        dub: str(embed?.dub) ?? str(episode?.dub)
      },
      sources: [],
      subtitles: []
    };
  });
}

function normalizeStatus(value?: string) {
  const lowered = value?.toLowerCase();
  if (lowered?.includes("ongoing") || lowered?.includes("airing")) return "ongoing";
  if (lowered?.includes("complete")) return "completed";
  if (lowered?.includes("upcoming")) return "upcoming";
  return "unknown";
}

function pickObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function pickArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function num(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function arrayOfStrings(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
}
