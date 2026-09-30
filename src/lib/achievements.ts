import type { LocalStatsSummary } from './localGameStore'

export interface AchievementContext {
  stats: LocalStatsSummary
  longestStreak: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  isUnlocked(ctx: AchievementContext): boolean
}

/**
 * Every condition here is derived purely from data that's actually tracked
 * (bests cover all 8 games; totalStars/hasThreeStarLevel only ever come
 * from the 5 level-based games — Sudoku, Chess and X&O are match/puzzle
 * based with no "levels", so a star-count achievement is deliberately never
 * the only way to unlock things, and nothing here requires stars from a
 * game that structurally can't produce them).
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Finish a puzzle in any game.',
    isUnlocked: (ctx) => ctx.stats.gamesWithRecords >= 1,
  },
  {
    id: 'well-rounded',
    title: 'Well Rounded',
    description: 'Play all 8 games at least once.',
    isUnlocked: (ctx) => ctx.stats.gamesWithRecords >= 8,
  },
  {
    id: 'getting-the-hang-of-it',
    title: 'Getting the Hang of It',
    description: 'Earn 10 stars.',
    isUnlocked: (ctx) => ctx.stats.totalStars >= 10,
  },
  {
    id: 'puzzle-enthusiast',
    title: 'Puzzle Enthusiast',
    description: 'Earn 50 stars.',
    isUnlocked: (ctx) => ctx.stats.totalStars >= 50,
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Earn 100 stars.',
    isUnlocked: (ctx) => ctx.stats.totalStars >= 100,
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Earn a flawless 3-star level.',
    isUnlocked: (ctx) => ctx.stats.hasThreeStarLevel,
  },
  {
    id: 'daily-devotion',
    title: 'Daily Devotion',
    description: 'Reach a 3-day Daily Unwind streak.',
    isUnlocked: (ctx) => ctx.longestStreak >= 3,
  },
  {
    id: 'week-of-calm',
    title: 'Week of Calm',
    description: 'Reach a 7-day Daily Unwind streak.',
    isUnlocked: (ctx) => ctx.longestStreak >= 7,
  },
]

export function getUnlockedAchievementIds(ctx: AchievementContext): Set<string> {
  return new Set(ACHIEVEMENTS.filter((a) => a.isUnlocked(ctx)).map((a) => a.id))
}
