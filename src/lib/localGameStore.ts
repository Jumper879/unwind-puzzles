/**
 * Local-only play/progress storage. Every game must be fully playable with
 * zero backend (see PLAN.md's offline-first PWA requirement and the
 * local-guest fallback already used for identity) — this is that fallback
 * for scores/progress specifically. When a Supabase project is configured,
 * `useGameResult` (src/games/shared/useGameResult.ts) also submits through
 * the real RPCs; this store keeps working either way as the instant local
 * mirror the UI reads from.
 */

import { todayDateString } from './date'

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

const BEST_PREFIX = 'unwind:local:best:'
const PROGRESS_PREFIX = 'unwind:local:progress:'
const TOTAL_PLAYTIME_KEY = 'unwind:local:totalPlaytimeMs'
const DAILY_PLAYED_PREFIX = 'unwind:local:dailyPlayed:'

/** Splits a `prefix:gameId:mode:difficulty` key back into its parts. Game ids are always kebab-case (no colons), so this split is unambiguous. */
function parseKey(key: string, prefix: string): { gameId: string; mode: string; difficulty: string } | null {
  if (!key.startsWith(prefix)) return null
  const rest = key.slice(prefix.length)
  const parts = rest.split(':')
  if (parts.length !== 3) return null
  const [gameId, mode, difficulty] = parts
  return { gameId, mode, difficulty }
}

function recordDailyGamePlayed(gameId: string): void {
  const key = DAILY_PLAYED_PREFIX + todayDateString()
  const played = readJSON<string[]>(key) ?? []
  if (!played.includes(gameId)) {
    localStorage.setItem(key, JSON.stringify([...played, gameId]))
  }
}

/** Game ids the player has completed a session in today (any result, win or lose). */
export function getDailyPlayedToday(): Set<string> {
  return new Set(readJSON<string[]>(DAILY_PLAYED_PREFIX + todayDateString()) ?? [])
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

  // Every game calls this exactly once per finished session (win or lose,
  // new best or not) — the one choke point every game's finish() already
  // goes through, so playtime/daily-played tracking lands here instead of
  // needing a separate call wired into all 8 games individually.
  const currentTotal = Number(localStorage.getItem(TOTAL_PLAYTIME_KEY) ?? '0')
  localStorage.setItem(TOTAL_PLAYTIME_KEY, String(currentTotal + Math.max(0, timeMs)))
  recordDailyGamePlayed(gameId)

  return isBetter
}

export function getLocalTotalPlaytimeMs(): number {
  return Number(localStorage.getItem(TOTAL_PLAYTIME_KEY) ?? '0')
}

export interface LocalBestRow {
  gameId: string
  mode: string
  difficulty: string
  score: number
  timeMs: number
  achievedAt: string
}

export interface LocalStatsSummary {
  bests: LocalBestRow[]
  gamesWithRecords: number
  totalStars: number
  totalPlaytimeMs: number
  hasThreeStarLevel: boolean
  gameIdsWithStars: Set<string>
}

/**
 * Scans every local best/progress key in localStorage to build the same
 * shape of summary Records/Stats/Achievements need — computed fresh each
 * call rather than kept as a second, driftable copy of the truth.
 */
export function getLocalStatsSummary(): LocalStatsSummary {
  const bests: LocalBestRow[] = []
  let totalStars = 0
  let hasThreeStarLevel = false
  const gameIdsWithStars = new Set<string>()

  for (const key of Object.keys(localStorage)) {
    const bestParts = parseKey(key, BEST_PREFIX)
    if (bestParts) {
      const best = readJSON<BestResult>(key)
      if (best) bests.push({ ...bestParts, ...best })
      continue
    }
    const progressParts = parseKey(key, PROGRESS_PREFIX)
    if (progressParts) {
      const progress = readJSON<LevelProgress>(key)
      if (progress) {
        for (const stars of Object.values(progress.starsByLevel)) {
          totalStars += stars
          if (stars > 0) gameIdsWithStars.add(progressParts.gameId)
          if (stars >= 3) hasThreeStarLevel = true
        }
      }
    }
  }

  return {
    bests,
    gamesWithRecords: new Set(bests.map((b) => b.gameId)).size,
    totalStars,
    totalPlaytimeMs: getLocalTotalPlaytimeMs(),
    hasThreeStarLevel,
    gameIdsWithStars,
  }
}

export interface PerGameProgress {
  highestLevel: number
  totalStars: number
}

/**
 * Per-game highest-level/total-stars, aggregated across every mode and
 * difficulty that game has ever recorded progress under — used for Home's
 * "Lv N / ★ N" box meta, which can't assume one canonical mode (Word
 * Search alone has 6 theme "modes", each with its own progress key).
 */
export function getPerGameProgress(): Record<string, PerGameProgress> {
  const result: Record<string, PerGameProgress> = {}

  for (const key of Object.keys(localStorage)) {
    const parts = parseKey(key, PROGRESS_PREFIX)
    if (!parts) continue
    const progress = readJSON<LevelProgress>(key)
    if (!progress) continue

    const entry = result[parts.gameId] ?? { highestLevel: 0, totalStars: 0 }
    entry.highestLevel = Math.max(entry.highestLevel, progress.highestLevel)
    entry.totalStars += Object.values(progress.starsByLevel).reduce((sum, s) => sum + s, 0)
    result[parts.gameId] = entry
  }

  return result
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
