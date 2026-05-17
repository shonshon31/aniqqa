"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnimeSummary, AppUser, UserProfile, WatchProgress } from "@/types/anime";

type AppState = {
  token?: string;
  user?: AppUser;
  activeProfile?: UserProfile;
  favorites: AnimeSummary[];
  progress: WatchProgress[];
  darkMode: boolean;
  theaterMode: boolean;
  setSession: (user: AppUser, token: string) => void;
  logout: () => void;
  setActiveProfile: (profileId: string) => void;
  toggleFavorite: (anime: AnimeSummary) => void;
  isFavorite: (animeId: string) => boolean;
  saveProgress: (progress: WatchProgress) => void;
  setTheaterMode: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      progress: [],
      darkMode: true,
      theaterMode: false,
      setSession: (user, token) =>
        set({
          user,
          token,
          activeProfile: user.profiles.find((profile) => profile.id === user.activeProfileId) ?? user.profiles[0]
        }),
      logout: () => set({ user: undefined, token: undefined, activeProfile: undefined }),
      setActiveProfile: (profileId) => {
        const user = get().user;
        const activeProfile = user?.profiles.find((profile) => profile.id === profileId);
        if (activeProfile && user) {
          set({ activeProfile, user: { ...user, activeProfileId: profileId } });
        }
      },
      toggleFavorite: (anime) => {
        const exists = get().favorites.some((item) => item.id === anime.id);
        set({ favorites: exists ? get().favorites.filter((item) => item.id !== anime.id) : [anime, ...get().favorites] });
      },
      isFavorite: (animeId) => get().favorites.some((item) => item.id === animeId),
      saveProgress: (next) => {
        const previous = get().progress.filter((item) => item.episodeId !== next.episodeId);
        set({ progress: [next, ...previous].slice(0, 50) });
      },
      setTheaterMode: (theaterMode) => set({ theaterMode }),
      setDarkMode: (darkMode) => set({ darkMode })
    }),
    {
      name: "aniqqa-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeProfile: state.activeProfile,
        favorites: state.favorites,
        progress: state.progress,
        darkMode: state.darkMode
      })
    }
  )
);
