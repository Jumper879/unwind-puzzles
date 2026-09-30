import { beforeEach, describe, expect, it } from 'vitest'
import {
  getDailyPlayedToday,
  getLocalStatsSummary,
  getLocalTotalPlaytimeMs,
  recordLocalBest,
  recordLocalLevelResult,
} from './localGameStore'

describe('localGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('accumulates total playtime across every recorded session, not just new bests', () => {
    recordLocalBest('word-search', 'animals', 'easy', 80, 5000)
    recordLocalBest('word-search', 'animals', 'easy', 60, 3000) // worse score, still played
    expect(getLocalTotalPlaytimeMs()).toBe(8000)
  })

  it('marks a game as played today the moment a best is recorded', () => {
    expect(getDailyPlayedToday().has('sudoku')).toBe(false)
    recordLocalBest('sudoku', '9', 'easy', 90, 4000)
    expect(getDailyPlayedToday().has('sudoku')).toBe(true)
  })

  it('summary counts distinct games with records from bests, and total stars from progress', () => {
    recordLocalBest('word-search', 'animals', 'easy', 90, 4000)
    recordLocalBest('fruit-match', 'classic', 'easy', 90, 4000)
    recordLocalLevelResult('word-search', 'animals', 'easy', 1, 3)
    recordLocalLevelResult('word-search', 'animals', 'easy', 2, 2)
    recordLocalLevelResult('fruit-match', 'classic', 'easy', 1, 1)

    const summary = getLocalStatsSummary()
    expect(summary.gamesWithRecords).toBe(2)
    expect(summary.totalStars).toBe(6)
    expect(summary.hasThreeStarLevel).toBe(true)
    expect(summary.gameIdsWithStars.has('word-search')).toBe(true)
    expect(summary.gameIdsWithStars.has('fruit-match')).toBe(true)
  })

  it('hasThreeStarLevel is false when no level ever reached 3 stars', () => {
    recordLocalLevelResult('word-search', 'animals', 'easy', 1, 2)
    expect(getLocalStatsSummary().hasThreeStarLevel).toBe(false)
  })

  it('games with only a best (no level progress, e.g. Sudoku/Chess/X&O) still count toward gamesWithRecords', () => {
    recordLocalBest('tic-tac-toe', 'classic', 'hard', 100, 6000)
    const summary = getLocalStatsSummary()
    expect(summary.gamesWithRecords).toBe(1)
    expect(summary.bests[0].gameId).toBe('tic-tac-toe')
  })
})
