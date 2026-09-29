export function computeScore(wordsFound: number, totalWords: number, hintsUsed: number): number {
  if (totalWords === 0) return 0
  const base = (wordsFound / totalWords) * 100
  const penalty = hintsUsed * 5
  return Math.max(0, Math.round(base - penalty))
}

export function computeStars(
  wordsFound: number,
  totalWords: number,
  hintsUsed: number,
): 0 | 1 | 2 | 3 {
  const complete = totalWords > 0 && wordsFound === totalWords
  if (complete && hintsUsed === 0) return 3
  if (complete) return 2
  if (totalWords > 0 && wordsFound >= totalWords / 2) return 1
  return 0
}
