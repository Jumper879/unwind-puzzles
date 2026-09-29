import { createRng, shuffle } from '../../../lib/rng'
import { emptyGrid } from './board'
import { countSolutions, solve } from './solver'
import type { Difficulty, Grid, SudokuPuzzle, SudokuSize } from './types'

// Target clue count per size/difficulty — a floor the remove loop aims for,
// not a guarantee (removal only ever proceeds while the puzzle stays
// uniquely solvable, so a puzzle can end up with more clues than the
// target if going lower would create a second solution). Difficulty is
// graded by clue count, not by which human solving techniques are
// required — a deliberate scope cut, see GAMES.md.
const TARGET_CLUES: Record<SudokuSize, Record<Difficulty, number>> = {
  4: { easy: 10, medium: 8, hard: 6 },
  6: { easy: 22, medium: 17, hard: 13 },
  9: { easy: 42, medium: 34, hard: 27 },
}

function generateSolvedGrid(size: SudokuSize, seed: string): Grid {
  const rng = createRng(`solved:${seed}`)
  const solved = solve(emptyGrid(size), size, () => shuffle(rng, range(size)))
  if (!solved) throw new Error('Failed to generate a solved sudoku grid — this should never happen')
  return solved
}

function range(size: SudokuSize): number[] {
  return Array.from({ length: size }, (_, i) => i + 1)
}

export function generateSudoku(
  size: SudokuSize,
  difficulty: Difficulty,
  seed: string,
): SudokuPuzzle {
  const solution = generateSolvedGrid(size, seed)
  const puzzle = [...solution]
  const rng = createRng(`remove:${seed}`)
  const cellOrder = shuffle(
    rng,
    Array.from({ length: size * size }, (_, i) => i),
  )
  const targetClues = TARGET_CLUES[size][difficulty]
  let clueCount = size * size

  for (const cellIndex of cellOrder) {
    if (clueCount <= targetClues) break
    const saved = puzzle[cellIndex]
    puzzle[cellIndex] = 0
    if (countSolutions(puzzle, size, 2) === 1) {
      clueCount--
    } else {
      puzzle[cellIndex] = saved
    }
  }

  return { size, puzzle, solution, difficulty, seed }
}
