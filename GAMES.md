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

## Not yet built

Sudoku Cards, Fruit Match, Crossword, Chess, Spot the Difference, Missing Piece — Phases 4–6 per
`PLAN.md`.
