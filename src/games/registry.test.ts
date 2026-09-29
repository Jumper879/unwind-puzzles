import { describe, expect, it } from 'vitest'
import { GAMES, getGame } from './registry'

describe('game registry', () => {
  it('has exactly the 8 games from the brief', () => {
    expect(GAMES).toHaveLength(8)
  })

  it('has unique ids', () => {
    const ids = new Set(GAMES.map((g) => g.id))
    expect(ids.size).toBe(GAMES.length)
  })

  it('looks games up by id', () => {
    expect(getGame('chess')?.name).toBe('Chess')
    expect(getGame('nonexistent')).toBeUndefined()
  })
})
