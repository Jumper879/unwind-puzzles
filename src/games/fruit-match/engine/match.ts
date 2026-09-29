import { indexOf, rowColOf } from './board'
import { BOARD_SIZE } from './types'
import type { Board, Cell, Special } from './types'

export interface MatchGroup {
  cells: number[]
  orientation: 'h' | 'v'
  fruit: number
}

/** Every maximal run of length >= 3 of the same fruit, scanned per row and per column. A single resolution can surface both a horizontal and a vertical group sharing a cell — that intersection is what makes it an L/T shape. */
export function findMatchGroups(board: Board): MatchGroup[] {
  const groups: MatchGroup[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    let runStart = 0
    for (let col = 1; col <= BOARD_SIZE; col++) {
      const prev = col > 0 ? board[indexOf(row, col - 1)] : null
      const curr = col < BOARD_SIZE ? board[indexOf(row, col)] : null
      const sameRun = prev && curr && prev.fruit === curr.fruit
      if (!sameRun) {
        const runLength = col - runStart
        if (runLength >= 3 && prev) {
          groups.push({
            cells: Array.from({ length: runLength }, (_, k) => indexOf(row, runStart + k)),
            orientation: 'h',
            fruit: prev.fruit,
          })
        }
        runStart = col
      }
    }
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    let runStart = 0
    for (let row = 1; row <= BOARD_SIZE; row++) {
      const prev = row > 0 ? board[indexOf(row - 1, col)] : null
      const curr = row < BOARD_SIZE ? board[indexOf(row, col)] : null
      const sameRun = prev && curr && prev.fruit === curr.fruit
      if (!sameRun) {
        const runLength = row - runStart
        if (runLength >= 3 && prev) {
          groups.push({
            cells: Array.from({ length: runLength }, (_, k) => indexOf(runStart + k, col)),
            orientation: 'v',
            fruit: prev.fruit,
          })
        }
        runStart = row
      }
    }
  }

  return groups
}

export function findMatchedCellIndices(board: Board): number[][] {
  return findMatchGroups(board).map((g) => g.cells)
}

/** The extra cells a triggered special piece clears, beyond itself. */
export function specialEffectArea(board: Board, index: number, special: Special): number[] {
  const [row, col] = rowColOf(index)
  if (special === 'line-h') {
    return Array.from({ length: BOARD_SIZE }, (_, c) => indexOf(row, c))
  }
  if (special === 'line-v') {
    return Array.from({ length: BOARD_SIZE }, (_, r) => indexOf(r, col))
  }
  if (special === 'bomb') {
    const area: number[] = []
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) area.push(indexOf(r, c))
      }
    }
    return area
  }
  if (special === 'color') {
    const cell = board[index]
    if (!cell) return []
    const area: number[] = []
    board.forEach((c, i) => {
      if (c && c.fruit === cell.fruit) area.push(i)
    })
    return area
  }
  return []
}

export function cellsEqual(a: Cell | null, b: Cell | null): boolean {
  return a === b || (a !== null && b !== null && a.fruit === b.fruit && a.special === b.special)
}
