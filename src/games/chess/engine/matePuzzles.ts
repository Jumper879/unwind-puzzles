import type { ChessPuzzle } from './types'

/**
 * Hand-authored mate-in-1 positions — original setups, not imported from
 * any puzzle database (see types.ts's comment on why). Kept to mate-in-1
 * deliberately: it's the one puzzle shape simple enough to verify by full
 * enumeration with total confidence (chess.js's own `isCheckmate()` after
 * applying the claimed move — see matePuzzles.test.ts). A mate-in-2/3
 * claim would need real engine-assisted verification of every reply,
 * which isn't set up yet — shipping only what's actually verified rather
 * than a plausible-looking guess.
 */
export const MATE_PUZZLES: ChessPuzzle[] = [
  {
    id: 'mate-rook-1',
    fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
    goal: 'Checkmate in 1',
    playerColor: 'w',
    solution: ['e1e8'],
    starThresholds: { moves: 1 },
    difficulty: 'easy',
  },
  {
    id: 'mate-queen-1',
    fen: '6k1/5ppp/8/8/8/8/8/4Q1K1 w - - 0 1',
    goal: 'Checkmate in 1',
    playerColor: 'w',
    solution: ['e1e8'],
    starThresholds: { moves: 1 },
    difficulty: 'easy',
  },
  {
    id: 'mate-rook-2',
    fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
    goal: 'Checkmate in 1',
    playerColor: 'w',
    solution: ['d1d8'],
    starThresholds: { moves: 1 },
    difficulty: 'medium',
  },
]

export function getMatePuzzle(id: string): ChessPuzzle | undefined {
  return MATE_PUZZLES.find((p) => p.id === id)
}
