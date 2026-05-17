"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/utils/format";

const avatarColors: Record<string, string> = {
  red: "bg-brand",
  crimson: "bg-rose-700",
  blue: "bg-sky-600"
};

export function ProfileSwitcher() {
  const user = useAppStore((state) => state.user);
  const activeProfile = useAppStore((state) => state.activeProfile);
  const setActiveProfile = useAppStore((state) => state.setActiveProfile);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {user.profiles.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => setActiveProfile(profile.id)}
          title={profile.name}
          className={cn(
            "grid size-8 place-items-center rounded text-xs font-black text-white ring-2 ring-transparent transition",
            avatarColors[profile.avatar] ?? "bg-zinc-700",
            activeProfile?.id === profile.id && "ring-white"
          )}
        >
          {profile.name.slice(0, 1).toUpperCase()}
        </button>
      ))}
    </div>
  );
}
