import { cached } from "@/services/cache";
import { fetchJson } from "@/services/http";
import type { AnimeDetails, AnimeSummary, Episode, PaginatedAnime, TermsByType } from "@/types/anime";
import { safeImage } from "@/utils/format";

const API_BASE = process.env.ANIKOTO_API_BASE ?? "https://anikotoapi.site";
const LIST_TTL = 1000 * 60 * 5;
const DETAILS_TTL = 1000 * 60 * 15;
const CATALOG_TTL = 1000 * 60 * 60;
const SEARCH_TTL = 1000 * 60 * 60;
const CATALOG_PER_PAGE = 100;
const CATALOG_SCAN_PAGES = Number(process.env.ANIKOTO_CATALOG_SCAN_PAGES ?? 50);
const DEEP_SEARCH_MAX_PAGES = Number(process.env.ANIKOTO_DEEP_SEARCH_MAX_PAGES ?? 120);

type RawAnime = Record<string, unknown>;
type RawEpisode = Record<string, unknown>;

export async function getRecentAnime(page = 1, perPage = 24): Promise<PaginatedAnime> {
  return cached(`recent:${page}:${perPage}`, LIST_TTL, async () => {
    return getRecentAnimePage(page, perPage);
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
  const term = query.trim().toLowerCase();
  if (term) {
    return deepSearchAnime(term, page, perPage);
  }

  const all = await getCatalogAnime();
  const start = (page - 1) * perPage;
  const items = all.items.slice(start, start + perPage);

  return {
    items,
    pagination: {
      page,
      perPage,
      totalItems: all.items.length,
      totalPages: Math.max(1, Math.ceil(all.items.length / perPage)),
      hasNextPage: start + perPage < all.items.length
    }
  };
}

export async function deepSearchAnime(query: string, page = 1, perPage = 24): Promise<PaginatedAnime> {
  const matches = await cached(`search:${query}`, SEARCH_TTL, async () => {
    const firstPage = await getRecentAnimePage(1, CATALOG_PER_PAGE);
    const totalPages = firstPage.pagination.totalPages ?? DEEP_SEARCH_MAX_PAGES;
    const pagesToFetch = Math.max(1, Math.min(DEEP_SEARCH_MAX_PAGES, totalPages));
    const byId = new Map<string, AnimeSummary>();

    addMatches(firstPage.items, query, byId);

    for (let pageNumber = 2; pageNumber <= pagesToFetch; pageNumber += 1) {
      const result = await getRecentAnime(pageNumber, CATALOG_PER_PAGE);
      addMatches(result.items, query, byId);

      if (byId.size >= 75) break;
    }

    return Array.from(byId.values()).sort((a, b) => rankSearchResult(b, query) - rankSearchResult(a, query));
  });

  const start = (page - 1) * perPage;
  const items = matches.slice(start, start + perPage);

  return {
    items,
    pagination: {
      page,
      perPage,
      totalItems: matches.length,
      totalPages: Math.max(1, Math.ceil(matches.length / perPage)),
      hasNextPage: start + perPage < matches.length
    }
  };
}

export async function getGenres(): Promise<string[]> {
  const list = await getCatalogAnime();
  const genres = new Set<string>();
  list.items.forEach((item) => item.genres.forEach((genre) => genres.add(genre)));
  return Array.from(genres).sort((a, b) => a.localeCompare(b));
}

export async function getCatalogAnime(): Promise<PaginatedAnime> {
  return cached(`catalog:${CATALOG_SCAN_PAGES}:${CATALOG_PER_PAGE}`, CATALOG_TTL, async () => {
    const firstPage = await getRecentAnimePage(1, CATALOG_PER_PAGE);
    const totalPages = firstPage.pagination.totalPages ?? CATALOG_SCAN_PAGES;
    const pagesToFetch = Math.max(1, Math.min(CATALOG_SCAN_PAGES, totalPages));
    const pages = [firstPage];

    for (let page = 2; page <= pagesToFetch; page += 1) {
      pages.push(await getRecentAnime(page, CATALOG_PER_PAGE));
    }

    const byId = new Map<string, AnimeSummary>();
    pages.flatMap((result) => result.items).forEach((item) => byId.set(item.id, item));
    const items = Array.from(byId.values());

    return {
      items,
      pagination: {
        page: 1,
        perPage: items.length,
        totalItems: firstPage.pagination.totalItems ?? items.length,
        totalPages: firstPage.pagination.totalPages,
        hasNextPage: pagesToFetch < totalPages
      }
    };
  });
}

async function getRecentAnimePage(page: number, perPage: number): Promise<PaginatedAnime> {
  const url = `${API_BASE}/recent-anime?page=${page}&per_page=${perPage}`;
  const data = await fetchJson<Record<string, unknown>>(url);
  return normalizeList(data, page, perPage);
}

function addMatches(items: AnimeSummary[], query: string, byId: Map<string, AnimeSummary>) {
  items.forEach((item) => {
    if (animeMatchesQuery(item, query)) byId.set(item.id, item);
  });
}

function animeMatchesQuery(item: AnimeSummary, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  const terms = normalizedQuery.split(" ").filter(Boolean);
  const haystack = normalizeSearchText([item.title, item.slug, item.synopsis, item.status, item.year, ...item.genres].join(" "));

  return terms.every((term) => haystack.includes(term));
}

function rankSearchResult(item: AnimeSummary, query: string) {
  const title = normalizeSearchText(item.title);
  const normalizedQuery = normalizeSearchText(query);
  let score = item.rating ?? 0;

  if (title === normalizedQuery) score += 100;
  else if (title.startsWith(normalizedQuery)) score += 60;
  else if (title.includes(normalizedQuery)) score += 35;

  return score;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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
