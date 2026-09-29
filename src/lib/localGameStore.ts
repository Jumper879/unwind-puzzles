/**
 * Local-only play/progress storage. Every game must be fully playable with
 * zero backend (see PLAN.md's offline-first PWA requirement and the
 * local-guest fallback already used for identity) — this is that fallback
 * for scores/progress specifically. When a Supabase project is configured,
 * `useGameResult` (src/games/shared/useGameResult.ts) also submits through
 * the real RPCs; this store keeps working either way as the instant local
 * mirror the UI reads from.
 */

interface BestResult {
  score: number
  timeMs: number
  achievedAt: string
}

interface LevelProgress {
  highestLevel: number
  starsByLevel: Record<number, number>
}

function bestKey(gameId: string, mode: string, difficulty: string): string {
  return `unwind:local:best:${gameId}:${mode}:${difficulty}`
}

function progressKey(gameId: string, mode: string, difficulty: string): string {
  return `unwind:local:progress:${gameId}:${mode}:${difficulty}`
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function getLocalBest(gameId: string, mode: string, difficulty: string): BestResult | null {
  return readJSON<BestResult>(bestKey(gameId, mode, difficulty))
}

/** Returns true if this result set a new local best (higher score, or same score + faster). */
export function recordLocalBest(
  gameId: string,
  mode: string,
  difficulty: string,
  score: number,
  timeMs: number,
): boolean {
  const key = bestKey(gameId, mode, difficulty)
  const existing = readJSON<BestResult>(key)
  const isBetter =
    !existing || score > existing.score || (score === existing.score && timeMs < existing.timeMs)
  if (isBetter) {
    localStorage.setItem(
      key,
      JSON.stringify({ score, timeMs, achievedAt: new Date().toISOString() }),
    )
  }
  return isBetter
}

export function getLocalLevelProgress(
  gameId: string,
  mode: string,
  difficulty: string,
): LevelProgress {
  return (
    readJSON<LevelProgress>(progressKey(gameId, mode, difficulty)) ?? {
      highestLevel: 0,
      starsByLevel: {},
    }
  )
}

/** Records stars for a level (kept as the max across replays, never double-counted) and advances highestLevel. */
export function recordLocalLevelResult(
  gameId: string,
  mode: string,
  difficulty: string,
  levelNumber: number,
  stars: number,
): LevelProgress {
  const key = progressKey(gameId, mode, difficulty)
  const current = getLocalLevelProgress(gameId, mode, difficulty)
  const nextStars = Math.max(current.starsByLevel[levelNumber] ?? 0, stars)
  const next: LevelProgress = {
    highestLevel: Math.max(current.highestLevel, stars > 0 ? levelNumber : current.highestLevel),
    starsByLevel: { ...current.starsByLevel, [levelNumber]: nextStars },
  }
  localStorage.setItem(key, JSON.stringify(next))
  return next
}
