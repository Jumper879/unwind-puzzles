import { describe, expect, it } from 'vitest'
import { generateSudoku } from './generator'
import { countSolutions } from './solver'
import { isValidPlacement } from './board'
import type { SudokuSize } from './types'

function isCompleteAndValid(grid: number[], size: SudokuSize): boolean {
  if (grid.some((v) => v === 0)) return false
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = grid[row * size + col]
      const rest = [...grid]
      rest[row * size + col] = 0
      if (!isValidPlacement(rest, size, row, col, value)) return false
    }
  }
  return true
}

describe('generateSudoku', () => {
  it('is deterministic for the same seed', () => {
    const a = generateSudoku(9, 'medium', 'seed-1')
    const b = generateSudoku(9, 'medium', 'seed-1')
    expect(a.puzzle).toEqual(b.puzzle)
    expect(a.solution).toEqual(b.solution)
  })

  it('differs for a different seed', () => {
    const a = generateSudoku(9, 'medium', 'seed-1')
    const b = generateSudoku(9, 'medium', 'seed-2')
    expect(a.solution).not.toEqual(b.solution)
  })

  for (const size of [4, 6, 9] as const) {
    it(`produces a complete, valid solution at size ${size}`, () => {
      const { solution } = generateSudoku(size, 'easy', `size-check-${size}`)
      expect(isCompleteAndValid(solution, size)).toBe(true)
    })

    it(`produces a puzzle with a UNIQUE solution at size ${size} (every difficulty)`, () => {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const { puzzle } = generateSudoku(size, difficulty, `unique-check-${size}-${difficulty}`)
        expect(countSolutions(puzzle, size, 2)).toBe(1)
      }
    })

    it(`the puzzle's given clues match the solution at size ${size}`, () => {
      const { puzzle, solution } = generateSudoku(size, 'medium', `match-check-${size}`)
      puzzle.forEach((value, i) => {
        if (value !== 0) expect(value).toBe(solution[i])
      })
    })
  }

  it('harder difficulty never has more clues than easier, at the same size', () => {
    const easy = generateSudoku(9, 'easy', 'difficulty-check')
    const medium = generateSudoku(9, 'medium', 'difficulty-check')
    const hard = generateSudoku(9, 'hard', 'difficulty-check')
    const clueCount = (g: number[]) => g.filter((v) => v !== 0).length
    expect(clueCount(easy.puzzle)).toBeGreaterThanOrEqual(clueCount(medium.puzzle))
    expect(clueCount(medium.puzzle)).toBeGreaterThanOrEqual(clueCount(hard.puzzle))
  })
})
