# PLAN.md — Unwind Puzzles

One Vite + React + TypeScript codebase shipping as a responsive web app, an installable PWA, and a Telegram Mini App, backed by Supabase. This plan covers architecture, folder structure, data model, and the 7 build phases from the brief.

**Status: Phase 1 done. Phase 2 (backend foundation) in progress** — full DB schema/RLS/RPCs/leaderboard functions and both auth paths are written and wired client-side; My Records/Global Leaderboard screens, the offline sync queue, and SECURITY.md are still to do, and none of it has run against a real Supabase project yet (none exists). See the Phase 2 note below the phase list.

---

## 1. Versions researched (live, not from memory)

| Library                      | Version found                       | Source                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Telegram Mini Apps (Bot API) | client script `telegram-web-app.js` | core.telegram.org/bots/webapps (fetched)               | `safeAreaInset`, `contentSafeAreaInset`, `requestFullscreen()`, `addToHomeScreen()` are **Bot API 8.0+** — recent, not long-stable. `disableVerticalSwipes()` is **7.7+**. Must feature-detect all four before calling.                                                                                                                                                                                                                                                                                                                         |
| `@supabase/supabase-js`      | 2.117.2                             | registry.npmjs.org (fetched)                           | `signInAnonymously()` gives a JWT with `is_anonymous: true`, usable directly in RLS policies. Anonymous session is lost on sign-out/clear-data/new device — matches the "start as guest" requirement.                                                                                                                                                                                                                                                                                                                                           |
| `vite-plugin-pwa`            | 1.3.0                               | registry.npmjs.org + vite-pwa-org docs (fetched)       | `VitePWA({ registerType: 'autoUpdate' })` for silent updates; separate prompt-based pattern exists for the "new version available" banner the brief asks for. `devOptions.enabled: true` needed to test the SW locally.                                                                                                                                                                                                                                                                                                                         |
| `chess.js`                   | 1.4.0                               | registry.npmjs.org + GitHub releases (fetched)         | **Hard breaking rewrite at v1.0.0**: `.load()`/`.loadPgn()`/`.move()`/constructor now _throw_ on invalid input instead of returning null; constructor is `new Chess(fen?, { skipValidation? })`; `Move.flags` deprecated in favor of `.isCapture()` etc. We build directly against v1.x — flagging so no v0.x-era code/examples leak in from old tutorials.                                                                                                                                                                                     |
| Stockfish WASM               | ambiguous, needs a spike            | npm registry + WebSearch (no single official doc page) | Two unrelated packages: `stockfish` (nmrugg, v19.0.0, used by chess.com, ships single- and multi-threaded builds) vs `stockfish.wasm` (lichess-org, v0.10.0, looks stale). **Recommendation: `stockfish` (nmrugg)**, using its single-threaded build by default — avoids the COOP/COEP `same-origin`/`require-corp` header requirement that multi-threaded SharedArrayBuffer builds need, which is one less deployment constraint across Vercel + the Telegram in-app browser. Will confirm with a short spike in Phase 5 before locking it in. |

Some npm/supabase doc pages 403'd to direct fetch; those were cross-checked via the npm registry JSON API instead, which is an equally authoritative version source.

---

## 2. Brand tokens (sampled directly from the logo files, not eyeballed)

Ran the actual PNGs through Pillow and took the dominant opaque pixel colors:

- Navy: **#04073A** (spec target was #070B3A — using the real asset value)
- Electric blue: **#1F61FA** (spec target was #2F6BFF — using the real asset value)
- White: **#FFFFFF**

Full 50–900 scales for navy and blue will be generated from these anchors (not the spec's approximations), plus the calm support palette (sky, mint, peach, lavender, butter yellow, coral) tuned to sit next to them. `icon.png` source is 2000×2000 — enough headroom to generate every favicon/PWA/Telegram icon size cleanly.

Fonts: Nunito (800/900 headings, 600/700 UI text), self-hosted as woff2 for offline PWA use — matches the rounded geometric feel of the wordmark.

---

## 3. Tech stack decisions

- **Vite + React + TypeScript (strict)**, React Router, Zustand, Framer Motion — as specified.
- **Styling: Tailwind CSS, with the design tokens defined as CSS custom properties, not hardcoded in the Tailwind config.** Reasoning: Tailwind gives utility velocity across 8 different game UIs without inventing a component-per-style-variant system; CSS variables (set on `:root` and swapped under `[data-theme="dark"]` / a Telegram theme-params listener) let light/dark/Telegram-theme switching happen at runtime with zero rebuild, which a Tailwind-config-only approach can't do. Tailwind's `theme.extend.colors` will simply reference `var(--color-*)`.
- Game engines are pure TS modules under `/src/games/<id>/engine`, no React imports, seeded RNG, unit-tested in isolation.
- Chess AI and puzzle/word-search generation run in Web Workers, not the main thread.

---

## 4. Folder structure

```
/brand                      brand source assets (done)
/public
/src
  /app                       root App shell, router, providers
  /platform                  adapter interface + browser & telegram impls
  /design                    tokens.css, theme.ts, tailwind token bridge
  /components                shared UI: cards, buttons, drawer, speech bubble
  /mascot                    SVG mascot component, moods, idle animations
  /games
    registry.ts
    tic-tac-toe/{engine,components}
    word-search/{engine,components}
    mosaic/{engine,components}
    spot-the-difference/{engine,components}
    crossword/{engine,components}
    chess/{engine,components}
    fruit-match/{engine,components}
    sudoku/{engine,components}
  /state                     zustand stores
  /lib                       supabase client, rng, platform detection, i18n
  /hooks
  /routes
  /workers                   stockfish.worker, puzzle-gen workers
  /dev                       /dev/icons preview page
/supabase
  /migrations
  /seed
  /functions                 edge functions (start_session, submit_result, telegram-auth, ...)
README.md  ARCHITECTURE.md  DATABASE.md  API.md  GAMES.md  CONTENT.md  SECURITY.md  DEPLOYMENT.md
```

---

## 5. Platform adapter (sketch)

Single `PlatformAdapter` interface in `/src/platform/index.ts`, selected once at startup by detecting `window.Telegram?.WebApp` with valid `initData`:

```ts
interface PlatformAdapter {
  identity: { getSession(): Promise<Session>; signInGuest(): Promise<Session> };
  chrome: { back(show, onClick); mainButton(...); secondaryButton(...) };
  haptics: { impact(style); notification(type) };
  theme: { colors: ThemeColors; onChange(cb): Unsubscribe };
  viewport: { safeAreaInsets: Insets; requestFullscreen(): Promise<void> };
  gestures: { disableVerticalSwipes(): void; enableVerticalSwipes(): void };
  storage: { local: KVStore; cloud?: KVStore };
  share: { share(payload): Promise<void> };
  install: { promptAddToHomeScreen(): Promise<void> };
}
```

Games only ever touch this interface, never `window.Telegram` directly. The Telegram impl feature-detects Bot-API-8.0-gated methods (`requestFullscreen`, `addToHomeScreen`, safe-area insets) before calling them, since those aren't guaranteed present on older clients. The PWA/browser impl backs `share` with the Web Share API and `install` with `beforeinstallprompt`.

---

## 6. Data model (summary — full spec goes in DATABASE.md)

Tables as listed in your brief: `profiles`, `identities`, `games`, `levels`, `daily_challenges`, `game_sessions`, `results`, `personal_bests`, `progress`, `streaks`, `achievements` / `profile_achievements`, `settings`, `events`.

Key relationships: `identities.profile_id → profiles.id` (many identities per profile, unique per provider); `levels.game_id → games.id`; `game_sessions.level_id/profile_id`; `results.session_id` unique 1:1 with a session; `personal_bests` maintained by a trigger off `results` insert. Leaderboards are Postgres views/functions using `rank()` window functions over `results`, exposing only `display_name`/`avatar_mood`/score/time — never raw profile or identity rows.

Clients never `INSERT` into `results` directly — only through `start_session` / `submit_result` SECURITY DEFINER RPCs, which re-validate solvable-puzzle results server-side where possible and apply plausibility checks (min time, max score, one submission per session).

RLS is enabled on every table from the first migration, not retrofitted later.

---

## 7. Build phases (unchanged from your brief, restated as checkpoints)

1. **Setup & shell** — ✅ done. tokens, brand assets (favicon set, `/dev/icons` preview comparing vertical-logo vs mascot-only), splash with animated wordmark, mascot component, hamburger drawer, home screen, platform adapter, PWA setup.
2. **Backend foundation** — 🚧 in progress. Supabase schema/migrations/RLS ✅, guest + Telegram auth ✅ (code written, untested live), sessions/results/personal-bests ✅, My Records + Global Leaderboard screens ⏳, offline sync queue ⏳.
3. **Template games** — Tic-Tac-Toe (X&O) and Word Search, fully polished end to end; these become the pattern for the rest.
4. **Sudoku Cards + Fruit Match.**
5. **Crossword + Chess** (full games vs Stockfish, plus the reference-1-style puzzle mode) — Stockfish package spike happens here.
6. **Spot the Difference + Mosaic/Missing Piece** — procedural scene generator for Spot the Difference.
7. **Daily Unwind, streaks, achievements, XP, tutorials, sound, full test pass, Lighthouse audit, docs complete.**

After each phase: run the app, test at 360×780 and desktop, fix issues, update the relevant doc file, short summary of done/next/needed-from-you.

---

## 8. Open questions before/along the way (not blocking Phase 1)

- **Stockfish package**: proposing `stockfish` (nmrugg) single-threaded by default — confirm or object before Phase 5.
- **Crossword word/clue list** and **Mosaic illustrations**: need a licensed source (or you supply originals) — will surface this again at Phase 5/6 with specific options, documented in CONTENT.md.
- **Icon finalization**: per your brief, Phase 1 ends with a `/dev/icons` side-by-side of vertical-logo vs mascot-only at 48/96/180px — you pick then, defaulting to vertical logo per your instruction otherwise.

---

## 9. Phase 1 report

**Built:** design tokens sampled from the real brand PNGs (`src/design/tokens.css`, Tailwind v4 bridged via `@theme inline`); `scripts/generate-icons.py` producing the full favicon/app-icon/maskable set plus the `/dev/icons` vertical-vs-mascot comparison (confirmed in-browser: vertical-logo text is illegible at 48px, mascot-only reads cleanly — vertical logo is still wired as the production default per your instruction, swap is one line if you want mascot-only instead); a hand-built SVG `<Mascot>` with 5 moods and idle animation (respects `prefers-reduced-motion`); the animated wordmark splash (respects reduced motion, skips instantly); the hamburger drawer with a real close button; the home screen (Daily Unwind card, honest streak empty-state, 8 game cards each tagged with its build phase); the `PlatformAdapter` (browser + Telegram, feature-detecting the Bot-API-8.0-gated methods); a working light/dark/system theme toggle; ESLint + Prettier + Vitest wired up (6 tests passing); a production build that installs as a PWA (~1.1MB precache).

**Bugs caught and fixed while testing in a real browser (not just typecheck):** the drawer had no way to close itself (hamburger button only opened, and was unreachable — covered by the open drawer's own z-index — once it was open); the horizontal/vertical logo lockups are pre-composed on a padded navy square canvas, so naively resizing them to a square and dropping them on the white home header/About page rendered as an unreadable navy blob — fixed by cropping to the true content bounding box and, for the two light-background spots (home header, About), using the mascot SVG + real text or a navy card mount instead of fighting the baked-in navy background (a chroma-key attempt was tried first and rejected — the artwork has a real navy-colored outline stroke baked into it, not just an anti-aliasing artifact, so keying left a visible fringe).

**Needed from you:** pick vertical-logo vs mascot-only for the production app icon (see `/dev/icons` — `npm run dev` then visit `/dev/icons`); everything else in Phase 1 is ready to build on.

## 10. Phase 2 progress (checkpoint, not done)

**Built:** all 8 migrations (`profiles`/`identities` with an auto-provisioning trigger, `games`/`levels`/`daily_challenges`, `game_sessions`/`results`/`personal_bests` with a sync trigger, `progress`/`streaks`/`level_progress`, `achievements`, `settings`/`events`, the 4 leaderboard functions, and the `start_session`/`submit_result`/`save_resume_state` RPCs) — RLS on every table from the start, no client insert path on anything score-relevant, full writeup in `DATABASE.md` with a Mermaid ER diagram. The `telegram-auth` Edge Function validates `initData` server-side (HMAC-SHA256 against the bot token, constant-time compare, 24h `auth_date` window) and mints a real Supabase session via the documented magic-link-token exchange pattern. `src/lib/supabase.ts` wires the client and degrades to local-only guest mode with a console warning when no project is configured, rather than throwing — so the app you're looking at right now still works with zero setup. Both platform adapters now do real auth through that same fallback-aware path, and a `useBootstrapSession` hook signs in a guest once per app load.

**Not done yet:** My Records / Global Leaderboard screens (still `ComingSoon` stubs — building them against a schema with zero rows felt like more stub-shuffling than value; better once there's something real to query), the offline sync queue for score submissions, `SECURITY.md`. None of the SQL or the Edge Function has run against a real project — there isn't one yet.

**Needed from you:** a Supabase project (URL + anon key, into `.env.local` — copy `.env.example`) to actually wire this up live, or say the word and I'll walk you through creating one. Same for a Telegram bot token via BotFather if/when you want the Telegram path testable.

Approve to move into Phase 2 (Supabase schema/migrations/RLS, guest + Telegram auth, sessions/results, My Records + Global Leaderboard, offline sync queue), or flag anything you want changed first.
