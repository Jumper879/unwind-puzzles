import { createRng, shuffle } from './rng'
import { GAMES } from '../games/registry'
import { GAME_COMPONENTS } from '../games/gameComponents'
import { todayDateString } from './date'

export interface DailyPick {
  slot: number
  gameId: string
}

/**
 * 3 games picked deterministically from today's date, so every player sees
 * the same 3 picks on the same day and they rotate automatically at
 * midnight with no server involved. Only picks games that actually have a
 * playable page (GAME_COMPONENTS) — a registry entry with no shipped
 * component yet would be a dead link, same rule as the home screen's grid.
 */
export function getDailyPicks(dateStr: string = todayDateString()): DailyPick[] {
  const eligible = GAMES.filter((g) => GAME_COMPONENTS[g.id])
  const rng = createRng(`daily-${dateStr}`)
  const chosen = shuffle(rng, eligible).slice(0, 3)
  return chosen.map((g, i) => ({ slot: i, gameId: g.id }))
}
