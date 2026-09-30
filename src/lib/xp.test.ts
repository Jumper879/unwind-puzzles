import { describe, expect, it } from 'vitest'
import { levelForXp, xpFromStars } from './xp'

describe('xp', () => {
  it('converts stars to xp at a fixed rate', () => {
    expect(xpFromStars(0)).toBe(0)
    expect(xpFromStars(10)).toBe(100)
  })

  it('level 1 starts at 0 xp', () => {
    expect(levelForXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100 })
  })

  it('rolls over to the next level at the threshold', () => {
    expect(levelForXp(99)).toEqual({ level: 1, xpIntoLevel: 99, xpForNextLevel: 100 })
    expect(levelForXp(100)).toEqual({ level: 2, xpIntoLevel: 0, xpForNextLevel: 100 })
    expect(levelForXp(250)).toEqual({ level: 3, xpIntoLevel: 50, xpForNextLevel: 100 })
  })
})
