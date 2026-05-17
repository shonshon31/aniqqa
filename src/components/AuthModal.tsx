"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { FormEvent, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser } from "@/types/anime";

type AuthResponse = {
  user: AppUser;
  token: string;
  message?: string;
};

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok) throw new Error(data.message ?? "Authentication failed");
      setSession(data.user, data.token);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function continueAsGuest() {
    setLoading(true);
    const response = await fetch("/api/auth/guest", { method: "POST" });
    const data = (await response.json()) as AuthResponse;
    setSession(data.user, data.token);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-5 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-md p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
            <XMarkIcon className="size-6" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input name="name" required placeholder="Profile name" className="w-full rounded bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500" />
          )}
          <input name="email" required type="email" placeholder="Email" className="w-full rounded bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500" />
          <input name="password" required type="password" placeholder="Password" minLength={8} className="w-full rounded bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500" />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button disabled={loading} type="submit" className="w-full rounded bg-brand px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
            {loading ? "Working..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button type="button" onClick={continueAsGuest} disabled={loading} className="mt-3 w-full rounded border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10">
          Continue as guest
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-5 text-sm text-zinc-300 hover:text-white">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
