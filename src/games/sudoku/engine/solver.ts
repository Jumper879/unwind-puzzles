import { isValidPlacement } from './board'
import type { Grid, SudokuSize } from './types'

function firstEmptyCell(grid: Grid, size: SudokuSize): number | null {
  for (let i = 0; i < size * size; i++) {
    if (grid[i] === 0) return i
  }
  return null
}

/** Counts solutions up to `limit` (default 2 — enough to tell "unique" from "not"), stopping early once found. */
export function countSolutions(grid: Grid, size: SudokuSize, limit = 2): number {
  const working = [...grid]
  let count = 0

  function backtrack(): boolean {
    const cellIndex = firstEmptyCell(working, size)
    if (cellIndex === null) {
      count++
      return count >= limit
    }
    const row = Math.floor(cellIndex / size)
    const col = cellIndex % size
    for (let value = 1; value <= size; value++) {
      if (!isValidPlacement(working, size, row, col, value)) continue
      working[cellIndex] = value
      if (backtrack()) return true
      working[cellIndex] = 0
    }
    return false
  }

  backtrack()
  return count
}

/** Returns a solved grid, or null if unsolvable. `order(size)` lets the generator randomize the value-try order per seed; defaults to ascending for a deterministic solve. */
export function solve(
  grid: Grid,
  size: SudokuSize,
  order: (row: number, col: number) => number[] = () => range(size),
): Grid | null {
  const working = [...grid]

  function backtrack(): boolean {
    const cellIndex = firstEmptyCell(working, size)
    if (cellIndex === null) return true
    const row = Math.floor(cellIndex / size)
    const col = cellIndex % size
    for (const value of order(row, col)) {
      if (!isValidPlacement(working, size, row, col, value)) continue
      working[cellIndex] = value
      if (backtrack()) return true
      working[cellIndex] = 0
    }
    return false
  }

  return backtrack() ? working : null
}

function range(size: SudokuSize): number[] {
  return Array.from({ length: size }, (_, i) => i + 1)
}
