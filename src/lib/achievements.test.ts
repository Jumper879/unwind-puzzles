import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, getUnlockedAchievementIds, type AchievementContext } from './achievements'
import type { LocalStatsSummary } from './localGameStore'

function emptyStats(): LocalStatsSummary {
  return {
    bests: [],
    gamesWithRecords: 0,
    totalStars: 0,
    totalPlaytimeMs: 0,
    hasThreeStarLevel: false,
    gameIdsWithStars: new Set(),
  }
}

describe('achievements', () => {
  it('nothing is unlocked with no data', () => {
    const ctx: AchievementContext = { stats: emptyStats(), longestStreak: 0 }
    expect(getUnlockedAchievementIds(ctx).size).toBe(0)
  })

  it('has no duplicate ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('first-steps unlocks after one recorded game', () => {
    const ctx: AchievementContext = {
      stats: { ...emptyStats(), gamesWithRecords: 1 },
      longestStreak: 0,
    }
    expect(getUnlockedAchievementIds(ctx).has('first-steps')).toBe(true)
    expect(getUnlockedAchievementIds(ctx).has('well-rounded')).toBe(false)
  })

  it('well-rounded requires all 8 games, not just several', () => {
    const ctx: AchievementContext = {
      stats: { ...emptyStats(), gamesWithRecords: 7 },
      longestStreak: 0,
    }
    expect(getUnlockedAchievementIds(ctx).has('well-rounded')).toBe(false)
    ctx.stats.gamesWithRecords = 8
    expect(getUnlockedAchievementIds(ctx).has('well-rounded')).toBe(true)
  })

  it('star-based achievements unlock at their exact thresholds', () => {
    const ctx: AchievementContext = { stats: { ...emptyStats(), totalStars: 10 }, longestStreak: 0 }
    const unlocked = getUnlockedAchievementIds(ctx)
    expect(unlocked.has('getting-the-hang-of-it')).toBe(true)
    expect(unlocked.has('puzzle-enthusiast')).toBe(false)
    expect(unlocked.has('century')).toBe(false)
  })

  it('streak achievements read longestStreak, not current-only progress', () => {
    const ctx: AchievementContext = { stats: emptyStats(), longestStreak: 7 }
    const unlocked = getUnlockedAchievementIds(ctx)
    expect(unlocked.has('daily-devotion')).toBe(true)
    expect(unlocked.has('week-of-calm')).toBe(true)
  })

  it('perfectionist only unlocks from an actual 3-star level, not high totalStars alone', () => {
    const ctx: AchievementContext = {
      stats: { ...emptyStats(), totalStars: 999, hasThreeStarLevel: false },
      longestStreak: 0,
    }
    expect(getUnlockedAchievementIds(ctx).has('perfectionist')).toBe(false)
  })
})
