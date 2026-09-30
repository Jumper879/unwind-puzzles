import { beforeEach, describe, expect, it } from 'vitest'
import { completeDailyStreak, getStreak } from './streak'

describe('streak', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts at 0 with no history', () => {
    expect(getStreak()).toEqual({ current: 0, longest: 0, lastCompletedDate: null })
  })

  it('first completion sets streak to 1', () => {
    const state = completeDailyStreak('2026-01-01')
    expect(state.current).toBe(1)
    expect(state.longest).toBe(1)
    expect(state.lastCompletedDate).toBe('2026-01-01')
  })

  it('completing the very next day increments the streak', () => {
    completeDailyStreak('2026-01-01')
    const state = completeDailyStreak('2026-01-02')
    expect(state.current).toBe(2)
    expect(state.longest).toBe(2)
  })

  it('completing the same day twice is idempotent (no double count)', () => {
    completeDailyStreak('2026-01-01')
    const state = completeDailyStreak('2026-01-01')
    expect(state.current).toBe(1)
  })

  it('skipping a day resets current to 1 but keeps the longest record', () => {
    completeDailyStreak('2026-01-01')
    completeDailyStreak('2026-01-02')
    completeDailyStreak('2026-01-03')
    // 3-day streak so far, longest = 3. Now skip to the 5th.
    const state = completeDailyStreak('2026-01-05')
    expect(state.current).toBe(1)
    expect(state.longest).toBe(3)
  })

  it('a later, longer streak raises the longest record', () => {
    completeDailyStreak('2026-01-01')
    completeDailyStreak('2026-01-02')
    completeDailyStreak('2026-01-10')
    completeDailyStreak('2026-01-11')
    completeDailyStreak('2026-01-12')
    const state = completeDailyStreak('2026-01-13')
    expect(state.current).toBe(4)
    expect(state.longest).toBe(4)
  })
})
