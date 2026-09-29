import { boardSize } from './board'
import type { TicTacToeMode } from './types'

export type Outcome = 'win' | 'draw' | 'loss'

/**
 * "Win streaks, fewer moves" per PLAN.md. Streak itself is tracked by the
 * streaks table / local progress, not embedded in this per-match score —
 * this is purely about the match just played: a draw always beats a loss,
 * any win beats a draw, and winning in the minimum possible marks (a
 * perfect game) scores the max.
 */
export function computeScore(
  outcome: Outcome,
  playerMoveCount: number,
  mode: TicTacToeMode,
): number {
  if (outcome === 'loss') return 0
  if (outcome === 'draw') return 50
  const minMoves = boardSize(mode)
  const extraMoves = Math.max(0, playerMoveCount - minMoves)
  return Math.max(60, 100 - extraMoves * 10)
}

export const STAR_THRESHOLDS = { 1: 50, 2: 70, 3: 100 } as const

export function computeStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= STAR_THRESHOLDS[3]) return 3
  if (score >= STAR_THRESHOLDS[2]) return 2
  if (score >= STAR_THRESHOLDS[1]) return 1
  return 0
}
