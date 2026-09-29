import { describe, expect, it } from 'vitest'
import { generateMosaicPuzzle, getDifficultyConfig } from './generator'
import { patternSignature } from './types'
import type { Difficulty } from './types'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

describe('generateMosaicPuzzle', () => {
  it('is deterministic for the same seed', () => {
    const a = generateMosaicPuzzle('medium', 'seed-1')
    const b = generateMosaicPuzzle('medium', 'seed-1')
    expect(a).toEqual(b)
  })

  it('produces a different puzzle for a different seed', () => {
    const a = generateMosaicPuzzle('medium', 'seed-1')
    const b = generateMosaicPuzzle('medium', 'seed-2')
    expect(a).not.toEqual(b)
  })

  for (const difficulty of DIFFICULTIES) {
    it(`builds a ${difficulty} grid of the configured size`, () => {
      const { gridSize } = getDifficultyConfig(difficulty)
      const puzzle = generateMosaicPuzzle(difficulty, `local-${difficulty}-1`)
      expect(puzzle.gridSize).toBe(gridSize)
      expect(puzzle.grid).toHaveLength(gridSize)
      for (const row of puzzle.grid) {
        expect(row).toHaveLength(gridSize)
      }
    })
  }

  it('places the missing cell inside the grid bounds', () => {
    for (let i = 1; i <= 20; i++) {
      const puzzle = generateMosaicPuzzle('hard', `bounds-${i}`)
      expect(puzzle.missingRow).toBeGreaterThanOrEqual(0)
      expect(puzzle.missingRow).toBeLessThan(puzzle.gridSize)
      expect(puzzle.missingCol).toBeGreaterThanOrEqual(0)
      expect(puzzle.missingCol).toBeLessThan(puzzle.gridSize)
    }
  })

  it('always produces exactly 4 choices with exactly one correct', () => {
    for (let i = 1; i <= 30; i++) {
      for (const difficulty of DIFFICULTIES) {
        const puzzle = generateMosaicPuzzle(difficulty, `count-${difficulty}-${i}`)
        expect(puzzle.choices).toHaveLength(4)
        const correctChoices = puzzle.choices.filter((c) => c.correct)
        expect(correctChoices).toHaveLength(1)
      }
    }
  })

  it('the correct choice matches the actual missing cell', () => {
    for (let i = 1; i <= 30; i++) {
      const puzzle = generateMosaicPuzzle('medium', `match-${i}`)
      const missingCell = puzzle.grid[puzzle.missingRow][puzzle.missingCol]
      const correctChoice = puzzle.choices.find((c) => c.correct)
      if (!correctChoice) throw new Error('no correct choice found')
      expect(patternSignature(correctChoice.pattern)).toBe(patternSignature(missingCell))
    }
  })

  it('every choice is visually distinct from every other choice (signature-unique)', () => {
    for (let i = 1; i <= 50; i++) {
      for (const difficulty of DIFFICULTIES) {
        const puzzle = generateMosaicPuzzle(difficulty, `distinct-${difficulty}-${i}`)
        const signatures = puzzle.choices.map((c) => patternSignature(c.pattern))
        expect(new Set(signatures).size).toBe(signatures.length)
      }
    }
  })

  it('the missing cell position still holds its original pattern in the grid (grid is not mutated)', () => {
    const puzzle = generateMosaicPuzzle('easy', 'grid-intact-1')
    const missingCell = puzzle.grid[puzzle.missingRow][puzzle.missingCol]
    const correctChoice = puzzle.choices.find((c) => c.correct)
    if (!correctChoice) throw new Error('no correct choice found')
    expect(patternSignature(missingCell)).toBe(patternSignature(correctChoice.pattern))
  })
})
