# aniqqa

A Netflix-inspired anime streaming platform built with Next.js, TypeScript, TailwindCSS, Framer Motion, Zustand, JWT auth routes, and an AnimeKoto-backed API layer.

## Features

- Cinematic Netflix-style homepage with hero carousel and horizontal rows
- Anime details pages with synopsis, genres, status, rating, episodes, trailer link, related anime, and recommendations
- Streaming page with HLS.js support, AnimeKoto embed fallback, subtitles, playback speed, quality selector UI, theater mode, keyboard shortcuts, skip intro, resume tracking, and auto-next routing
- Sign up, login, guest mode, user profiles, avatar chips, JWT issuing API routes
- Favorites/My List, watch history, continue watching, local persistence
- Real-time debounced search with genre/status/sort filters and load-more browsing
- PWA manifest/icons, responsive layouts, sticky navbar, skeleton loading, hover card actions
- Centralized API service layer with retry handling, in-memory cache, error fallback paths

## AnimeKoto Integration

The backend proxy reads from:

```bash
ANIKOTO_API_BASE=https://anikotoapi.site
```

Implemented routes:

- `GET /api/anime?page=1&perPage=24&q=&genre=&status=&sort=`
- `GET /api/anime/:id`
- `GET /api/genres`

AnimeKoto data is fetched server-side in `src/services/anikoto.ts`, normalized into typed app models, cached in memory, and then consumed by the frontend. The app only uses streams or embeds returned by the configured API source.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `dev`, `build`, and `start` scripts run Next.js through `node --use-system-ca` so server-side AnimeKoto requests can trust the local Windows certificate store.

If you prefer pnpm:

```bash
corepack enable
pnpm install
pnpm dev
```

## Environment Variables

```bash
ANIKOTO_API_BASE=https://anikotoapi.site
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Production Notes

- Replace the in-memory user store in `src/services/users.ts` with MongoDB, PostgreSQL, or another durable store.
- Keep `JWT_SECRET` long and private.
- Add persistent server-side watch history if cross-device syncing is required.
- Keep streaming restricted to AnimeKoto-provided URLs or embeds.
- Add Redis in front of AnimeKoto for shared cache persistence in multi-instance deployments.

## Useful Commands

```bash
npm run dev
npm run typecheck
npm run build
npm run lint
```

## Current Local Verification Note

The normal PowerShell `npm` shim was broken in this environment. If that happens locally, call npm directly:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```
