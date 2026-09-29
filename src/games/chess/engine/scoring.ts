import type { ChessDifficulty } from './types'

export type GameOutcome = 'win' | 'draw' | 'loss'

/** Beating a harder opponent is worth more — winning on Hard should outscore winning on Easy. */
export function computeFullGameScore(outcome: GameOutcome, difficulty: ChessDifficulty): number {
  if (outcome === 'loss') return 0
  const base = outcome === 'draw' ? 40 : 70
  const bonus = difficulty === 'hard' ? 30 : difficulty === 'medium' ? 15 : 0
  return base + bonus
}

export function computeFullGameStars(outcome: GameOutcome): 0 | 1 | 2 | 3 {
  if (outcome === 'win') return 3
  if (outcome === 'draw') return 1
  return 0
}

/** Puzzle mode (mate-in-1 and capture puzzles): fewer extra moves/hints scores higher. */
export function computePuzzleScore(solved: boolean, hintsUsed: number): number {
  if (!solved) return 0
  return Math.max(50, 100 - hintsUsed * 20)
}

export function computePuzzleStars(solved: boolean, hintsUsed: number): 0 | 1 | 2 | 3 {
  if (!solved) return 0
  if (hintsUsed === 0) return 3
  if (hintsUsed === 1) return 2
  return 1
}
