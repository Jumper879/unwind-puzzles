# PLAN.md — Unwind Puzzles

One Vite + React + TypeScript codebase shipping as a responsive web app, an installable PWA, and a Telegram Mini App, backed by Supabase. This plan covers architecture, folder structure, data model, and the 7 build phases from the brief.

**Status: Phases 1–6 done.** All 8 games are now shipped and playable, verified end to end in a real browser, not just typechecked — see the Phase 6 report below for Spot the Difference and Missing Piece (the last two games), plus the Phase 5 report for the Stockfish package spike and the mascot/icon branding switch. Live at https://unwind-puzzles.vercel.app/ and github.com/Jumper879/unwind-puzzles (private).

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
2. **Backend foundation** — ✅ done (untested against a live project — see the Phase 2 note). Supabase schema/migrations/RLS, guest + Telegram auth, sessions/results/personal-bests, My Records + Global Leaderboard screens, offline sync queue, SECURITY.md.
3. **Template games** — ✅ done. Tic-Tac-Toe (X&O) and Word Search, fully polished end to end; these become the pattern for the rest.
4. **Sudoku Cards + Fruit Match.** — ✅ done.
5. **Crossword + Chess** — ✅ done. Full games vs Stockfish, plus the reference-1-style puzzle mode; Stockfish package spike resolved (see the Phase 5 report).
6. **Spot the Difference + Mosaic/Missing Piece** — ✅ done. Both fully procedural (no licensed
   art), see the Phase 6 report below.
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

## 10. Phase 2 report

**Built:** all 9 migrations (`profiles`/`identities` with an auto-provisioning trigger, `games`/`levels`/`daily_challenges`, `game_sessions`/`results`/`personal_bests` with a sync trigger, `progress`/`streaks`/`level_progress`, `achievements`, `settings`/`events`, the 4 leaderboard functions, `start_session`/`submit_result`/`save_resume_state`, and `export_my_data`/`request_account_deletion`) — RLS on every table from the start, no client insert path on anything score-relevant, full writeup in `DATABASE.md` (ER diagram) and `SECURITY.md`. The `telegram-auth` Edge Function validates `initData` server-side and mints a real Supabase session via the documented magic-link-token exchange pattern. `src/lib/supabase.ts` degrades to local-only guest mode when no project is configured, rather than throwing — the app works with zero setup either way. Both platform adapters do real auth through that fallback-aware path; `useBootstrapSession` signs in a guest once per app load. My Records and Global Leaderboard are real screens now (not stubs) — real queries scoped by RLS, real RPC calls for the leaderboard, honest "not connected yet" / "no records yet" empty states, verified in-browser. `src/lib/syncQueue.ts` is the offline sync queue: queues a `submit_result` call when offline or on network failure, drains on the `online` event, and treats the RPC's "session is not active" error as already-synced rather than retrying forever (the idempotency the brief asked for).

**Not done / explicitly deferred, not silently skipped:** per-game server-side solution re-validation (nothing to validate against yet — no game content exists before Phase 3) and RPC rate limiting, both flagged in `SECURITY.md` rather than built speculatively; the account-deletion Edge Function itself (`request_account_deletion` just logs the request — the actual `auth.admin.deleteUser` call needs the service role, deferred to Phase 7 per that function's comment). None of the SQL or the Edge Function has run against a real project — there isn't one yet.

**Needed from you:** a Supabase project (URL + anon key, into `.env.local` — copy `.env.example`, and also into Vercel's Environment Variables for the deployed build) to wire this up live, or say the word and I'll walk you through creating one. Same for a Telegram bot token via BotFather if/when you want the Telegram path testable.

Pushed to `github.com/Jumper879/unwind-puzzles` (private) and live at https://unwind-puzzles.vercel.app/.

## 11. Phase 3 report

**Built:** full engines for both games (`src/games/tic-tac-toe/engine`, `src/games/word-search/engine`) — pure TS, unit-tested, no React. Tic-Tac-Toe: minimax with alpha-beta, classic 3×3 provably unbeatable on Hard (verified by a test that plays two Hard instances against each other and asserts every game draws), a depth-capped+heuristic version for the 4×4 connect4 variant, undo, hints that always suggest the objectively best move. Word Search: seeded deterministic generator (8-direction placement per difficulty, overlap only on matching letters, graceful word-skip if placement fails, and a filler-collision fix that scans for and breaks accidental word occurrences in the random fill — all with regression tests), drag-to-select that snaps an imprecise drag to the nearest of 8 straight-line directions, 6 starter themes, 10 procedurally-generated levels per theme/difficulty with real unlock progression. Both wired into the game registry with code-split lazy-loaded components (confirmed in the production build: separate ~9KB/~12KB chunks, not bundled into the main app). Both games are fully playable **right now** with zero backend — scores/progress/stars save to `localStorage` — since Supabase's `levels` table has no rows yet (see below), and "offline play for everything" shouldn't wait on that. Full rules/scoring writeup in `GAMES.md`.

**Verified live, not just typechecked**: played a full Tic-Tac-Toe match end to end via simulated clicks (correct win/draw detection, scoring, star rating, "new personal best" badge all fired correctly) and a real word-search drag-select (computed the exact deterministic level-1 layout, dragged across the true word location, confirmed it registered as found, confirmed early-finish scoring). One real bug caught this way: the Word Search Hint button initially just incremented a counter with no visible effect — dead UI — fixed to actually reveal the hinted word's cells for 1.6s before I called it done.

**Not done / scope boundary, not an oversight:** live score sync via the `start_session`/`submit_result` RPCs isn't wired into gameplay — those RPCs need a real `levels` row to reference, and none exist in Supabase yet (seeding `levels` with content matching each game's seed scheme is an ops/content task, not a Phase 3 code task). Relax mode (no timer/star pressure) isn't wired as a toggle yet. Undo isn't implemented for Word Search (less applicable there — nothing to "undo" in a find-the-word game beyond deselecting, which dragging away already does for free).

**Needed from you:** nothing blocking — both games are playable at https://unwind-puzzles.vercel.app/games/tic-tac-toe and /games/word-search right now.

## 12. Phase 4 report

**Built:** Sudoku Cards (4×4/6×6/9×9, generator + backtracking solver that verifies every puzzle has a **provably unique solution**, not just an assumed one — `generator.test.ts` checks this directly at every size and difficulty via a solution-counter with early exit; card-first tap interaction, notes/pencil mode with auto-clear, live same-digit and conflict highlighting, mistake counter, hints) and Fruit Match (8×8, 6 fruit types, seeded no-initial-match board generation, full match resolution with all three special-piece types from the brief — 4-in-a-line → line clear, L/T shape → bomb, 5+-in-a-line → color clear — cascading combos, no-possible-move detection with reshuffle, score-target-within-move-limit level goals). Both fully tested (34 new engine tests, 73 total across the project) and code-split. Full design writeup in `GAMES.md`.

**Two real bugs caught by testing, not just typechecking:**

1. A React stale-closure bug in Sudoku's hint handler — `finish()` was reading `hintsUsed` from the render closure instead of the value the same handler had just set, so completing a puzzle via hint would undercount by one (same class of bug as `TicTacToePage`'s `finishMatch` fix in Phase 3 — fixed the same way, by passing the current value explicitly instead of trusting the closure).
2. A test-only bug that looked like a real hang: `npx vitest run` on the Fruit Match suite didn't finish within 120 seconds. Root cause was in my own test helper, not the engine — it filled the board's "background" cells with one uniform fruit value, which made almost the entire 8×8 board one giant accidental match and turned a simple 3-match test into a near-full-board cascade. Fixed the helper to use a provably match-free striped background (`(row+col)%3`) instead, and added a defensive 50-cascade cap to the engine's resolve loop regardless, so a _real_ future bug in that area fails fast with a wrong-but-finite result instead of hanging.

**Scope cuts made deliberately, documented in `GAMES.md` rather than silently skipped:** Sudoku's difficulty is graded by clue count, not by which human solving techniques (naked singles, pointing pairs, etc.) a puzzle requires — a full technique-based grader is a much larger undertaking on its own. Fruit Match's level goal is "score target within a move limit" only — collect-X-fruits and clear-jelly goals from the brief would each need their own board-state layer.

**Needed from you:** nothing blocking — try them at https://unwind-puzzles.vercel.app/games/sudoku and /games/fruit-match.

## 13. Phase 5 report

**Built:** Crossword (original word/clue list, backtracking grid-fill generator, custom on-screen
keyboard) and Chess (chess.js + Stockfish full game, plus capture and mate-in-1 puzzle modes) —
both fully playable, verified live in a browser including a real move-by-move game against the
actual Stockfish engine running in a Web Worker. 24 new tests, 95 total across the project.

**The Stockfish spike, resolved**: `stockfish` (nmrugg), lite single-threaded build. The full NNUE
build turned out to be **~99MB** (found by actually inspecting the installed package — the docs
undersold this), so lite-single (~1.8MB) was the only realistic choice anyway, confirming the
Phase 2 recommendation. Verified live in a real Worker — direct `postMessage`/`onmessage` with raw
UCI strings, no wrapper needed — before building anything on top of it.

**Also done this phase** (a mid-session request, not originally scoped to Phase 5): switched the
production app icon from the vertical logo to the mascot alone (`icon.png`), per your side-by-side
comparison at `/dev/icons` — the vertical logo's text was illegible at small sizes. In-app "logo"
spots (drawer, About) switched to the same mascot + real text for consistency; the unused
raster-logo component and files were removed (PWA precache dropped another ~330KB).

**Three real bugs caught by testing, not by inspection:**

1. Two of my own hand-designed crossword grid templates (a 7×7 needing five 7-letter words against
   a word list with only one; a 5×5 with four mutually-intersecting 5-letter slots) simply
   couldn't be filled — caught by a test that actually tries to fill them, not by counting
   constraints on paper. Shipped with the one template that's actually verified to work.
2. A hand-designed "mate-in-1" chess puzzle wasn't actually checkmate — the king had an escape
   square I missed by eye. Caught by a test that applies the claimed move with chess.js and checks
   `isCheckmate()`, before it ever shipped.
3. A `react-hooks` purity-lint error in the chess full-game page (`Date.now()` inside a function
   reachable from an async call path) — fixed by wrapping `finish` in `useCallback`, matching the
   pattern already used in `TicTacToePage`.

**Scope cuts, documented not hidden**: crossword ships with one grid template and no difficulty
selector (one that didn't change anything would be a fake control); chess auto-queens on promotion
(no promotion-choice UI yet); chess puzzles stop at mate-in-1 (verifying a forced multi-move line
needs real search, not just single-move checkmate detection).

**Needed from you:** nothing blocking — try Crossword and Chess at
https://unwind-puzzles.vercel.app/games/crossword and /games/chess. Approve to move into Phase 6
(Spot the Difference + Missing Piece/Mosaic), or flag anything you want changed first.

---

## 14. Phase 6 report

**Built:** Spot the Difference (procedural scene generator, tap-to-find, hint) and Missing Piece
(procedural mosaic-tile generator, 3×3–5×5 grid, multiple-choice with verified-distinct decoys) —
all 8 games from the brief are now shipped. Both new games are fully procedural: no external or
licensed art, same policy already used for Fruit Match's fruit icons and Chess's original puzzle
positions, and it directly resolves the open question from Phase 1 about needing a licensed source
for Mosaic's illustrations. 19 new engine tests (9 Spot the Difference, 10 Missing Piece), 114
total across the project.

**A real geometry bug caught by testing, not by eyeballing**: Spot the Difference's first object
size range (`0.08–0.15` of canvas width) was mathematically too large to pack medium/hard's 14–18
objects at the required minimum spacing — a genuine "doesn't fit" impossibility, not a
retry-budget shortfall. `generator.test.ts` asserting the exact target object count caught it;
fixed by shrinking the size range and gap, then re-verified.

**A real test-tooling bug, isolated and confirmed before concluding anything**: an early Playwright
verification script for Spot the Difference reported "0/4 found" tapping the exact known hotspot
coordinates, which looked like a broken tap handler. Root-caused by isolating a single tap and
watching it register correctly — the script's `page.locator('svg[aria-label]').first()` was
matching the Mascot component's own `aria-label`'d SVG (which renders above the two scene canvases)
instead of Scene A, so every computed tap coordinate landed off both scenes entirely. Fixed by
scoping the locator to `svg[aria-label="Scene A"]`; the re-run then found all 4 differences with
zero wrong taps and produced a correct 3-star result. The app's tap-detection logic was correct the
whole time — this was purely a test-script locator bug, confirmed rather than assumed per the
project's established pattern of ruling out tooling issues before calling something an app bug.

**Missing Piece's decoy design**: rather than generating decoys via rotation/mirror transforms
(which risks a shape like a circle or a symmetric stripe looking *identical* after a 90°/180°
rotation despite different underlying data — a real correctness trap), each shape has its own
fixed, hand-authored list of variants with genuinely different geometry, so "different variant"
always means "visually different render" by construction. Every choice is additionally checked
against a running `Set` of signatures before being accepted, guaranteeing all 4 choices are
distinct — verified across 50 seeds × 3 difficulties in `generator.test.ts`, not assumed. With only
3 possible decoys, the game also can't have a true losing state: worst case, 3 wrong picks
eliminate every decoy and the correct tile is the only one left enabled.

**Scope cuts, documented not hidden**: Missing Piece ships 3×3/4×4/5×5 (easy/medium/hard) rather
than the brief's 3×3–6×6 range — same "document the cut" pattern as Crossword's single template;
later drag-to-place-and-rotate interaction and multi-missing-piece levels from the original brief
aren't built. Spot the Difference ships single-object changes only (no combined move+recolor on
one object).

**A pre-existing test-suite flakiness noted, not introduced here**: running the full suite with
default parallelism intermittently times out one or two of the heaviest pre-existing tests (the
tic-tac-toe hard-AI minimax search, the Sudoku generator's clue-count comparison) under worker CPU
contention — both pass cleanly every time when run in isolation or with `--no-file-parallelism`.
Not a Phase 6 regression; flagged here since it showed up while running the full suite for this
report.

**Needed from you:** nothing blocking — try Spot the Difference and Missing Piece at
https://unwind-puzzles.vercel.app/games/spot-the-difference and /games/mosaic once this deploys.
Phase 7 (Daily Unwind, streaks, achievements, XP, tutorials, sound, full test pass, Lighthouse
audit, docs complete) is the only phase left — say the word to start it, or flag anything you want
changed first.
