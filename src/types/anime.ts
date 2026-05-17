export type AnimeStatus = "ongoing" | "completed" | "upcoming" | "unknown";

export type TermsByType = Record<string, string[]>;

export type AnimeSummary = {
  id: string;
  title: string;
  slug?: string;
  poster?: string;
  cover?: string;
  synopsis?: string;
  rating?: number;
  status?: AnimeStatus;
  episodeCount?: number;
  year?: number;
  genres: string[];
  termsByType?: TermsByType;
};

export type Episode = {
  id: string;
  number: number;
  title: string;
  synopsis?: string;
  duration?: number;
  thumbnail?: string;
  embedUrl?: {
    sub?: string;
    dub?: string;
  };
  sources?: StreamSource[];
  subtitles?: SubtitleTrack[];
};

export type StreamSource = {
  url: string;
  quality?: string;
  type?: "hls" | "mp4" | "embed";
};

export type SubtitleTrack = {
  label: string;
  lang: string;
  url: string;
  default?: boolean;
};

export type AnimeDetails = AnimeSummary & {
  banner?: string;
  trailer?: string;
  season?: string;
  episodes: Episode[];
  related: AnimeSummary[];
  recommendations: AnimeSummary[];
};

export type PaginatedAnime = {
  items: AnimeSummary[];
  pagination: {
    page: number;
    perPage: number;
    totalPages?: number;
    totalItems?: number;
    hasNextPage: boolean;
  };
};

export type WatchProgress = {
  animeId: string;
  episodeId: string;
  animeTitle: string;
  episodeTitle: string;
  poster?: string;
  timestamp: number;
  duration: number;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  maturity: "kids" | "teen" | "adult";
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
  profiles: UserProfile[];
  activeProfileId: string;
  favorites: string[];
  history: WatchProgress[];
  notifications: string[];
};
