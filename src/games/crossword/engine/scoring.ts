export function computeScore(
  correctCells: number,
  totalCells: number,
  revealsUsed: number,
): number {
  if (totalCells === 0) return 0
  const base = (correctCells / totalCells) * 100
  return Math.max(0, Math.round(base - revealsUsed * 5))
}

export function computeStars(complete: boolean, revealsUsed: number): 0 | 1 | 2 | 3 {
  if (!complete) return 0
  if (revealsUsed === 0) return 3
  if (revealsUsed <= 2) return 2
  return 1
}
