const STREAK_KEY = 'unwind:local:streak'

export interface StreakState {
  current: number
  longest: number
  lastCompletedDate: string | null
}

function readStreak(): StreakState {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { current: 0, longest: 0, lastCompletedDate: null }
    return JSON.parse(raw) as StreakState
  } catch {
    return { current: 0, longest: 0, lastCompletedDate: null }
  }
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / msPerDay)
}

export function getStreak(): StreakState {
  return readStreak()
}

/**
 * Call once all of today's Daily Unwind picks are complete. Idempotent —
 * calling it again the same day (e.g. re-visiting the Daily Unwind page)
 * never double-counts. A gap of more than one day resets the streak to 1
 * rather than 0, since completing today's picks always starts (or
 * continues) a streak, it's just not "consecutive" from before.
 */
export function completeDailyStreak(dateStr: string): StreakState {
  const state = readStreak()
  if (state.lastCompletedDate === dateStr) return state

  const isConsecutive =
    state.lastCompletedDate !== null && daysBetween(state.lastCompletedDate, dateStr) === 1
  const current = isConsecutive ? state.current + 1 : 1
  const next: StreakState = {
    current,
    longest: Math.max(state.longest, current),
    lastCompletedDate: dateStr,
  }
  localStorage.setItem(STREAK_KEY, JSON.stringify(next))
  return next
}
