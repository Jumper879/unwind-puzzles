import { describe, expect, it } from 'vitest'
import { createRng, randomInt, shuffle } from './rng'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng('hello')
    const b = createRng('hello')
    const seqA = Array.from({ length: 10 }, () => a())
    const seqB = Array.from({ length: 10 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('differs for different seeds', () => {
    const a = createRng('hello')
    const b = createRng('world')
    expect(a()).not.toBe(b())
  })

  it('produces values in [0, 1)', () => {
    const rng = createRng('range-check')
    for (let i = 0; i < 200; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('randomInt', () => {
  it('stays within [0, max)', () => {
    const rng = createRng('int-check')
    for (let i = 0; i < 200; i++) {
      const v = randomInt(rng, 7)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(7)
    }
  })
})

describe('shuffle', () => {
  it('is a permutation of the input, deterministic per seed', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    const shuffledA = shuffle(createRng('shuffle-seed'), items)
    const shuffledB = shuffle(createRng('shuffle-seed'), items)
    expect(shuffledA).toEqual(shuffledB)
    expect([...shuffledA].sort()).toEqual([...items].sort())
  })
})
