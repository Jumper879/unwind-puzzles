import { describe, expect, it } from 'vitest'
import { generateScenePuzzle, getDifficultyConfig } from './generator'

describe('generateScenePuzzle', () => {
  it('is deterministic for the same seed', () => {
    const a = generateScenePuzzle('easy', 'seed-1')
    const b = generateScenePuzzle('easy', 'seed-1')
    expect(a.sceneA).toEqual(b.sceneA)
    expect(a.sceneB).toEqual(b.sceneB)
    expect(a.differences).toEqual(b.differences)
  })

  it('differs for a different seed', () => {
    const a = generateScenePuzzle('easy', 'seed-1')
    const b = generateScenePuzzle('easy', 'seed-2')
    expect(a.sceneA).not.toEqual(b.sceneA)
  })

  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    it(`produces exactly the configured object/change counts at ${difficulty}`, () => {
      const config = getDifficultyConfig(difficulty)
      const puzzle = generateScenePuzzle(difficulty, `count-check-${difficulty}`)
      expect(puzzle.sceneA).toHaveLength(config.objectCount)
      expect(puzzle.differences).toHaveLength(config.changeCount)
    })
  }

  it('every difference hotspot has a positive radius and normalized (0-1ish) coordinates', () => {
    const puzzle = generateScenePuzzle('hard', 'hotspot-check')
    for (const diff of puzzle.differences) {
      expect(diff.radius).toBeGreaterThan(0)
      expect(diff.x).toBeGreaterThanOrEqual(0)
      expect(diff.x).toBeLessThanOrEqual(1.1)
      expect(diff.y).toBeGreaterThanOrEqual(0)
      expect(diff.y).toBeLessThanOrEqual(1.1)
    }
  })

  it('every declared difference actually differs between scene A and scene B', () => {
    const puzzle = generateScenePuzzle('medium', 'diff-check')
    for (const diff of puzzle.differences) {
      const inA = puzzle.sceneA.find((o) => o.id === diff.objectId)
      const inB = puzzle.sceneB.find((o) => o.id === diff.objectId)
      expect(inA).toBeDefined()
      if (diff.kind === 'removed') {
        expect(inB).toBeUndefined()
      } else {
        expect(inB).toBeDefined()
        expect(inB).not.toEqual(inA)
      }
    }
  })

  it('no object is changed twice (each difference references a distinct object)', () => {
    const puzzle = generateScenePuzzle('hard', 'distinct-check')
    const ids = puzzle.differences.map((d) => d.objectId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('objects the puzzle did NOT change are identical between scene A and scene B', () => {
    const puzzle = generateScenePuzzle('medium', 'unchanged-check')
    const changedIds = new Set(puzzle.differences.map((d) => d.objectId))
    for (const objA of puzzle.sceneA) {
      if (changedIds.has(objA.id)) continue
      const objB = puzzle.sceneB.find((o) => o.id === objA.id)
      expect(objB).toEqual(objA)
    }
  })
})
