export function computeScore(found: number, total: number, wrongTaps: number, hintsUsed: number): number {
  if (total === 0) return 0
  const base = (found / total) * 100
  return Math.max(0, Math.round(base - wrongTaps * 5 - hintsUsed * 8))
}

export function computeStars(complete: boolean, wrongTaps: number, hintsUsed: number): 0 | 1 | 2 | 3 {
  if (!complete) return 0
  if (wrongTaps === 0 && hintsUsed === 0) return 3
  if (wrongTaps <= 2 && hintsUsed <= 1) return 2
  return 1
}
