export function computeScore(solved: boolean, attemptsUsed: number, hintsUsed: number): number {
  if (!solved) return 0
  const attemptPenalty = Math.max(0, attemptsUsed - 1) * 15
  const hintPenalty = hintsUsed * 20
  return Math.max(10, 100 - attemptPenalty - hintPenalty)
}

export function computeStars(
  solved: boolean,
  attemptsUsed: number,
  hintsUsed: number,
): 0 | 1 | 2 | 3 {
  if (!solved) return 0
  if (attemptsUsed === 1 && hintsUsed === 0) return 3
  if (attemptsUsed <= 2 && hintsUsed <= 1) return 2
  return 1
}
