import { describe, expect, it } from 'vitest'
import { getDailyPicks } from './daily'
import { GAMES } from '../games/registry'
import { GAME_COMPONENTS } from '../games/gameComponents'

describe('getDailyPicks', () => {
  it('is deterministic for the same date', () => {
    const a = getDailyPicks('2026-03-05')
    const b = getDailyPicks('2026-03-05')
    expect(a).toEqual(b)
  })

  it('picks 3 distinct games', () => {
    const picks = getDailyPicks('2026-03-05')
    expect(picks).toHaveLength(3)
    expect(new Set(picks.map((p) => p.gameId)).size).toBe(3)
  })

  it('only picks games with a real, playable component (no dead links)', () => {
    for (let day = 1; day <= 28; day++) {
      const dateStr = `2026-04-${String(day).padStart(2, '0')}`
      const picks = getDailyPicks(dateStr)
      for (const pick of picks) {
        expect(GAME_COMPONENTS[pick.gameId]).toBeDefined()
        expect(GAMES.some((g) => g.id === pick.gameId)).toBe(true)
      }
    }
  })

  it('varies across different dates', () => {
    const days = Array.from({ length: 14 }, (_, i) => `2026-05-${String(i + 1).padStart(2, '0')}`)
    const allPickSets = days.map((d) => getDailyPicks(d).map((p) => p.gameId).sort().join(','))
    expect(new Set(allPickSets).size).toBeGreaterThan(1)
  })
})
