import type { Difficulty } from './types'

/**
 * Level goal is "reach a score target within a move limit" — the simplest
 * of the goal types in the brief (collect-X-fruits and clear-jelly would
 * need their own board-state layers; scope cut, see GAMES.md). Stars scale
 * with how far past the target the final score landed.
 */
export function computeStars(finalScore: number, targetScore: number): 0 | 1 | 2 | 3 {
  if (finalScore >= targetScore * 1.6) return 3
  if (finalScore >= targetScore * 1.3) return 2
  if (finalScore >= targetScore) return 1
  return 0
}

export function targetScoreFor(level: number, difficulty: Difficulty): number {
  const base = difficulty === 'easy' ? 800 : difficulty === 'medium' ? 1200 : 1700
  return base + (level - 1) * 250
}

export function moveLimitFor(difficulty: Difficulty): number {
  return difficulty === 'easy' ? 25 : difficulty === 'medium' ? 20 : 16
}
