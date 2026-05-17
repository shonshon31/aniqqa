export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function toRuntime(seconds?: number) {
  if (!seconds) return "24m";
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins}m`;
}

export function titleCase(value: string) {
  return value.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
}

export function safeImage(seed: string, kind: "poster" | "banner" = "poster") {
  const encoded = encodeURIComponent(seed || "anime");
  if (kind === "banner") return `https://picsum.photos/seed/${encoded}-wide/1600/900`;
  return `https://picsum.photos/seed/${encoded}/480/720`;
}
