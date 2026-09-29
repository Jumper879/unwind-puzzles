import type { BoxDims, Grid, SudokuSize } from './types'

// 4x4 -> 2x2 boxes. 6x6 -> 2 rows x 3 cols boxes (3 across, 2 down). 9x9 -> 3x3.
export function boxDims(size: SudokuSize): BoxDims {
  if (size === 4) return { rows: 2, cols: 2 }
  if (size === 6) return { rows: 2, cols: 3 }
  return { rows: 3, cols: 3 }
}

export function boxIndex(row: number, col: number, size: SudokuSize): number {
  const { rows, cols } = boxDims(size)
  const boxesAcross = size / cols
  return Math.floor(row / rows) * boxesAcross + Math.floor(col / cols)
}

export function peers(row: number, col: number, size: SudokuSize): [number, number][] {
  const { rows, cols } = boxDims(size)
  const result: [number, number][] = []
  for (let c = 0; c < size; c++) if (c !== col) result.push([row, c])
  for (let r = 0; r < size; r++) if (r !== row) result.push([r, col])

  const boxRowStart = Math.floor(row / rows) * rows
  const boxColStart = Math.floor(col / cols) * cols
  for (let r = boxRowStart; r < boxRowStart + rows; r++) {
    for (let c = boxColStart; c < boxColStart + cols; c++) {
      if (r !== row && c !== col) result.push([r, c])
    }
  }
  return result
}

export function isValidPlacement(
  grid: Grid,
  size: SudokuSize,
  row: number,
  col: number,
  value: number,
): boolean {
  for (const [r, c] of peers(row, col, size)) {
    if (grid[r * size + c] === value) return false
  }
  return true
}

export function cloneGrid(grid: Grid): Grid {
  return [...grid]
}

export function emptyGrid(size: SudokuSize): Grid {
  return Array(size * size).fill(0)
}

export function findConflicts(grid: Grid, size: SudokuSize): Set<number> {
  const conflicts = new Set<number>()
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = grid[row * size + col]
      if (value === 0) continue
      for (const [r, c] of peers(row, col, size)) {
        if (grid[r * size + c] === value) {
          conflicts.add(row * size + col)
          conflicts.add(r * size + c)
        }
      }
    }
  }
  return conflicts
}
