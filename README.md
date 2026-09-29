# Unwind Puzzles

A calm, single-player puzzle collection — one codebase that ships as a responsive web app, an
installable PWA, and a Telegram Mini App.

See [PLAN.md](./PLAN.md) for architecture, the data model, and the build-phase roadmap.

## Stack

Vite + React + TypeScript (strict), React Router, Zustand, Framer Motion, Tailwind CSS v4
(design tokens as CSS variables — see `src/design/tokens.css`), vite-plugin-pwa. Supabase
(Postgres/Auth/RLS/Edge Functions) lands in Phase 2.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build         # typecheck + production build
npm run test           # vitest, single run
npm run test:watch     # vitest, watch mode
npm run lint            # eslint
npm run format          # prettier --write
npm run icons            # regenerate /public/icons from /brand (needs Python + Pillow)
```

## Project layout

- `src/platform/` — the `PlatformAdapter` interface plus browser and Telegram implementations.
  Games and screens only ever talk to this interface, never to `window.Telegram` directly.
- `src/mascot/` — the hand-built SVG mascot component and its mood variants.
- `src/games/registry.ts` — the list of the 8 games; each one's engine/component lands in its
  own `src/games/<id>/` folder as it's built (see PLAN.md's phases).
- `src/design/tokens.css` — the single source of truth for color/font tokens, sampled directly
  from the brand assets rather than approximated.
- `brand/` — source brand assets (full-resolution). `public/brand/` holds the web-optimized
  copies actually served to the app; `scripts/generate-icons.py` derives `public/icons/` from
  `brand/icon.png` and `brand/logo-vertical.png`.

## Environment variables

None yet — Supabase keys land in `.env.example` in Phase 2.
