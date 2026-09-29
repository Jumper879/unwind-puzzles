# GAMES.md

Rules, engine design, and scoring for each game. Engines are pure TypeScript under
`src/games/<id>/engine/` — no React, unit-tested in isolation, driven by the seeded RNG in
`src/lib/rng.ts` where a puzzle needs to be reproducible.

**Scoring/progress is currently local-only** (`src/lib/localGameStore.ts`, `localStorage`) for
every game below. The `start_session`/`submit_result` RPCs in `DATABASE.md` exist and are
RLS-correct, but calling them needs a real row in the `levels` table to reference — and no levels
have been seeded into Supabase yet (that's a content/ops task once a project exists), so wiring
live sync in would just be dead code that always errors. Local play already satisfies "offline
play for everything"; live sync is a follow-up once `levels` has real rows matching each game's
seed scheme below.

## X&O (Tic-Tac-Toe)

`src/games/tic-tac-toe/`

- **Modes:** `classic` (3×3, three in a row) and `connect4` (4×4, four in a row — direct
  placement like classic, not gravity-based Connect Four; "connect4" is the mode's id, not a
  literal port of that game).
- **Difficulty / AI** (`engine/ai.ts`): minimax with alpha-beta pruning.
  - **Classic 3×3** is small enough to solve perfectly, no depth cap — **Hard is provably
    unbeatable** (`ai.test.ts` verifies this by playing two "hard" instances against each other
    across 5 trials and asserting every game ends in a draw).
  - **Connect4 4×4** (16 cells) is not small enough for an unpruned solve on the UI thread, so it
    gets a depth cap (6 plies) plus a heuristic evaluation (counts open lines weighted by how many
    marks each side already has in them) for non-terminal cutoff nodes. Hard is strong but not
    claimed to be provably perfect here — that distinction is deliberate, not an oversight.
  - **Easy**: 20% best move / 80% random. **Medium**: 70% best move / 30% random.
- **Hint** (`suggestMove`): always the objectively best move regardless of difficulty — hints
  never "lie" to teach a false lesson.
- **Scoring** (`engine/scoring.ts`) — "win streaks, fewer moves" per the brief: a loss scores 0, a
  draw scores 50, a win scores `100 − 10×(movesOverMinimum)` floored at 60, so winning always beats
  drawing and a perfect-minimum-moves win (3 marks classic / 4 marks connect4) scores exactly 100.
  Star thresholds: 1★ ≥ 50 (draw or worse loss-avoidance), 2★ ≥ 70, 3★ = 100 (perfect win).
- **Undo**: pops the last player+AI move pair, so it's always the player's turn again afterward.
- Play is match-based (pick mode + difficulty, play unlimited matches), not level-gated — there's
  no natural "level 4 of tic-tac-toe," so the level-map/unlock system doesn't apply here. Personal
  best is tracked per `(mode, difficulty)`.

## Word Search

`src/games/word-search/`

- **Generator** (`engine/generator.ts`): seeded, deterministic — the same
  `(theme, difficulty, seed)` always produces the same grid (`generator.test.ts` verifies this).
  Places the longest words first (higher placement success rate), retries up to 300 random
  `(position, direction)` attempts per word, allows overlap only where letters already match, and
  **skips** a word gracefully (never fails the whole puzzle) if it can't be placed after all
  attempts.
- **Directions by difficulty** (`engine/difficulty.ts`), per the brief: easy = → ↓ only (2
  directions, 10×10 grid, 6 words); medium adds all 4 diagonals but no reversed straight lines (6
  directions, 12×12, 8 words); hard = all 8 including backwards (14×14, 10 words).
- **Filler-collision fix**: after filling gaps with random letters, the generator scans every
  straight line the difficulty's directions allow for an _unintentional_ occurrence of any of the
  theme's words (not just the ones in this puzzle) and mutates one filler letter to break it —
  never touching a letter that belongs to a real placement. Capped at 20 fix passes.
  `generator.test.ts` has a regression test for this specifically.
- **Themes** (`engine/themes.ts`): 6 to start (Animals, Fruits, Ocean, Space, Weather, Garden).
  Fully data-driven — adding theme #7 through #20+ is a `CONTENT.md`-scale data edit, not an
  engine change.
- **Levels**: procedurally generated per level number (`seed = "level-{n}"`), 10 levels per
  `(theme, difficulty)`. Completing a level (any stars) unlocks the next — real progression without
  needing pre-authored level content.
- **Selection**: drag-to-select snaps to the nearest of the puzzle's allowed 8 directions
  (`components/selection.ts`, unit-tested), so an imprecise diagonal drag still reads as a clean
  straight line. Found words get a rotating highlight color from the calm accent palette (sky,
  mint, peach, lavender, butter, coral — cycling if there are more than 6 words).
- **Scoring** (`engine/scoring.ts`): `score = round(100 × wordsFound/totalWords) − 5×hintsUsed`,
  floored at 0. Stars: 3★ = all words, 0 hints; 2★ = all words, any hints; 1★ = at least half the
  words (a player can end early via **Finish** — relax-mode-style, no pressure to complete); 0★
  otherwise.
- **Hint**: reveals (briefly highlights, doesn't auto-solve) one random not-yet-found word's cells
  for 1.6s, and counts toward the hint penalty above — the player still has to drag it themselves.

## Sudoku Cards

`src/games/sudoku/`

- **Sizes**: 4×4 (2×2 boxes), 6×6 (2×3 boxes), 9×9 (3×3 boxes) — `engine/board.ts`'s `boxDims`
  generalizes row/col/box "peer" logic to all three rather than hardcoding 9×9.
- **Generator** (`engine/generator.ts`): fills a full valid grid via randomized backtracking (the
  solver in `engine/solver.ts` with a per-cell shuffled value order), then removes clues one at a
  time in random order, keeping a removal only if `countSolutions` (backtracking with early exit
  at 2) still finds exactly one solution — so every generated puzzle is **verified unique**, not
  just assumed to be (`generator.test.ts` checks this directly at every size × difficulty).
  Deterministic per `(size, difficulty, seed)`.
- **Difficulty = clue count**, not solving technique: target clue counts per size/difficulty are a
  floor the removal loop aims for (removal only proceeds while uniqueness holds, so a puzzle can
  end up with more clues than the target). Grading by which human techniques (naked singles,
  pointing pairs, etc.) a puzzle requires is a real, much larger undertaking — deliberately out of
  scope here, not an oversight.
- **Interaction**: card-first, per the brief — tap a number card (showing how many of that digit
  remain unplaced) to select it, then tap a cell to place it; tapping a cell that already holds the
  selected digit erases it. **Notes mode** toggles pencil marks instead of real placement; placing
  a real digit auto-clears that digit from every peer's notes. Same-digit cells and rule conflicts
  (same digit sharing a row/column/box) are highlighted live.
- **Mistakes/hints**: a wrong placement increments the mistake counter but is left on the board
  (not reverted) so the player can see and fix it themselves. Hint fills one random empty cell with
  its correct value. **Scoring** (`engine/scoring.ts`): `100 − 10×mistakes − 8×hints`, floored at
  40; 3★ = flawless, 2★ = ≤2 mistakes and ≤1 hint, 1★ = any completed solve.

## Fruit Match

`src/games/fruit-match/`

- **Board**: 8×8, 6 fruit types. `engine/board.ts`'s `createBoard` guarantees no match exists at
  deal time (each new cell avoids whichever fruit type would complete a run of 3 with the two
  cells already placed to its left/above).
- **Match resolution** (`engine/resolve.ts`) — the trickiest part of this engine: a swap is applied
  tentatively, matches (3+ runs, scanned per row and per column via `engine/match.ts`) are found,
  and if none exist the swap is rejected and the board is untouched. Otherwise: **4-in-a-line**
  becomes a line-clear special, **5+-in-a-line** becomes a color-clear special (clears every cell of
  that special's own fruit type when later triggered), and an **L/T shape** — a horizontal and
  vertical run sharing exactly one cell — becomes a bomb (clears a 3×3 area when triggered). New
  specials are placed at the swap's landing cell when possible, not cleared with the rest of their
  group. Any _existing_ special piece caught in a clear expands the clear to its effect area
  (breadth-first, so one special triggering another chains correctly), then gravity refills empty
  columns and the whole process repeats for cascades — each successive cascade scores at a higher
  combo multiplier. A hard 50-cascade cap guards against a future logic bug turning into a hang
  rather than a wrong-but-finite result (caught one during development: an early test-board helper
  that accidentally filled most of the board with one uniform "background" value created a
  near-board-spanning match and a very slow resolve — fixed in the test helper, not the engine, but
  the cap stays as defense-in-depth).
- **No-moves detection**: after every settle, `hasAnyPossibleMove` checks all adjacent pairs for a
  swap that would match anything; if none exists, `createPlayableBoard` reshuffles (regenerates a
  fresh match-free board, retrying until at least one legal move exists too).
- **Level goal**: reach a score target within a move limit — the simplest of the three goal types
  in the brief. Collect-X-fruits and clear-jelly goals would need their own board-state layers on
  top of this engine; noted as a real scope cut in `engine/scoring.ts`'s comment, not implemented.
  10 procedurally-generated levels per difficulty, real unlock progression, same pattern as Word
  Search.
- **Visuals**: soft-3D "clay" fruit icons (radial gradient + inset highlight + drop shadow, same
  material language as the home screen's game icons) rather than illustrated fruit art — a
  placeholder swap-in point for real artwork later, same as the other games' icon placeholders.

## Crossword

`src/games/crossword/`

- **Content**: an original word/clue list (`engine/wordlist.ts`, ~65 words across lengths 3–7,
  simple clues written for this project — not sourced from any external crossword database, so
  there's no license question to resolve, unlike importing one would raise).
- **Generator** (`engine/generator.ts`): a fixed grid _template_ (block layout, 180°-rotationally
  symmetric) gets filled by backtracking — longest/most-constrained slots first, candidates tried
  in a seeded-shuffled order, a word never reused twice in one puzzle, each slot's clue attached to
  the word actually placed there. Deterministic per `(template, seed)`.
- **Only one template ships so far, deliberately**: two denser hand-designed attempts — a 7×7
  needing five different 7-letter words against a list that only has one, and a 5×5 with four
  mutually-intersecting 5-letter slots — both failed to fill at all, caught by
  `generator.test.ts` actually trying to fill them rather than by inspection. The generator
  algorithm itself is verified correct and deterministic; growing the word list and adding denser
  templates is a content task from here, not an engine change. Because of this, there's no
  difficulty selector yet either — offering one that didn't actually change the puzzle would be a
  control that looks functional but isn't, so it's left out rather than faked.
- **Interaction**: tap a cell to select it (tap the same cell again to flip between across/down
  when both exist there); typing auto-advances along the active word; backspace clears the current
  cell, or steps back and clears the previous one if the current cell is already empty — standard
  crossword-app behavior. A custom on-screen A–Z keyboard is used instead of the device's native
  keyboard, per the brief ("doesn't fight the mobile keyboard").
- **Check/Reveal**: Check flags any filled-but-wrong cells for 1.5s without changing them; Reveal
  fills in one correct letter and counts against the score. **Scoring**
  (`engine/scoring.ts`): `round(100 × correctCells/totalCells) − 5×reveals`; 3★ = complete with 0
  reveals, 2★ = complete with ≤2 reveals, 1★ = complete at all.

## Chess

`src/games/chess/`

- **Rules engine**: chess.js v1.x (a hard breaking rewrite from 0.x — throws on illegal moves/FEN
  instead of returning null; flagged back in `PLAN.md`'s Phase 2 research, built directly against
  the current API). `engine/boardCells.ts` flattens its `board()` output into row-major cells for
  rendering — verified against the real package (starting position, a position after a move) in
  `boardCells.test.ts` rather than assumed from memory of the API shape.
- **AI — the Stockfish spike, resolved**: `stockfish` (nmrugg/Chess.com's build), the **lite
  single-threaded** WASM variant specifically (~1.8MB total). The full NNUE build is **~99MB** —
  confirmed by actually inspecting the installed package, not the docs — nowhere near shippable.
  Verified live in a real `Worker` (not assumed from reading the minified source): `new
Worker('/stockfish/stockfish-19-lite-single.js')` speaks UCI directly over plain
  `postMessage`/`onmessage` strings, no wrapper library needed (`engine/stockfish.ts`). Difficulty
  maps to Stockfish's own `Skill Level` (0–20) and search `movetime`
  (`engine/types.ts`'s `DIFFICULTY_CONFIG`). The engine file is excluded from the PWA's install-time
  precache (`vite.config.ts`) — loaded on demand via the ordinary HTTP cache instead of adding
  1.8MB to every installer's initial download for a feature many players won't touch.
- **Full Game mode** (`components/FullGamePage.tsx`): tap-to-select-then-tap-target, legal-move
  dots, undo (pops one FEN snapshot), hint (a short Stockfish search, shown as a highlight, not
  auto-played), board flip, checkmate/stalemate/draw detection. Always plays as White; promotion
  auto-queens (no promotion-choice UI yet — a real, deliberate simplification, not a bug).
- **Puzzle mode** — two kinds, both **original positions**, not imported from any puzzle database
  (the brief flags checking the Lichess puzzle database's license before use; writing our own
  sidesteps that question entirely):
  - **Capture puzzles** (`engine/capturePuzzle.ts`): one knight/bishop/rook, a few static black
    pawns, on a small empty board — its own tiny engine, not chess.js, since there's no second
    player here and a "random black reply" would risk breaking a hand-computed minimum-moves
    claim. The true minimum is instead **computed by BFS** over the real move graph (position ×
    remaining-targets bitmask), so "3 stars = optimal" is a provable fact, not an estimate — same
    approach as the sudoku generator verifying uniqueness instead of assuming it.
  - **Mate-in-1 puzzles** (`engine/matePuzzles.ts`): kept to mate-in-1 specifically because it's
    the one shape simple enough to verify with total confidence — apply the claimed move with
    chess.js, assert `isCheckmate()`. This caught a real error during authoring: a hand-designed
    "mate-in-1" left the king a legal escape square the eye missed, caught by the test before it
    ever shipped (`matePuzzles.test.ts`). Mate-in-2/3 aren't shipped yet — verifying a forced
    multi-move line needs real search, not just single-move checkmate detection, which isn't set
    up.
- **Scoring** (`engine/scoring.ts`): full games score higher for beating a harder difficulty
  (winning on Hard outscores winning on Easy); puzzles score `100 − 20×hintsUsed` (capture
  puzzles: extra moves beyond the BFS-computed minimum count the same as a hint).

## Not yet built

Spot the Difference, Missing Piece — Phase 6 per `PLAN.md`.
