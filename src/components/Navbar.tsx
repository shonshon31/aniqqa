"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlassIcon, MoonIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { useAppStore } from "@/store/useAppStore";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const [authOpen, setAuthOpen] = useState(false);

  const nav = [
    ["Home", "/"],
    ["Search", "/search"],
    ["My List", "/my-list"]
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-gradient-to-b from-black/90 to-black/20 px-5 py-4 backdrop-blur md:px-10">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-xl font-black lowercase text-brand md:text-2xl">aniqqa</Link>
            <div className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className={pathname === href ? "text-white" : "hover:text-white"}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Search" onClick={() => router.push("/search")} className="rounded-full p-2 hover:bg-white/10">
              <MagnifyingGlassIcon className="size-5" />
            </button>
            <button type="button" aria-label="Dark mode" className="hidden rounded-full p-2 hover:bg-white/10 md:block">
              <MoonIcon className="size-5" />
            </button>
            <ProfileSwitcher />
            {user ? (
              <button type="button" onClick={logout} className="rounded border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/10">Logout</button>
            ) : (
              <button type="button" onClick={() => setAuthOpen(true)} className="inline-flex items-center gap-2 rounded bg-brand px-3 py-2 text-sm font-bold">
                <UserCircleIcon className="size-5" />
                Sign in
              </button>
            )}
          </div>
        </nav>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
