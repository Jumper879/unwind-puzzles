export function computeScore(mistakes: number, hintsUsed: number): number {
  return Math.max(40, 100 - mistakes * 10 - hintsUsed * 8)
}

export function computeStars(mistakes: number, hintsUsed: number): 0 | 1 | 2 | 3 {
  if (mistakes === 0 && hintsUsed === 0) return 3
  if (mistakes <= 2 && hintsUsed <= 1) return 2
  return 1 // reaching a full solve always earns at least 1 star
}
