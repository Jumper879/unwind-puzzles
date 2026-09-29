import type { Board, Cell, Mark, TicTacToeMode, WinResult } from './types'

/** classic = standard 3x3; connect4 = "4 in a row" on a 4x4 grid (no gravity — same direct-placement rules, bigger board). */
export function boardSize(mode: TicTacToeMode): number {
  return mode === 'classic' ? 3 : 4
}

export function createEmptyBoard(mode: TicTacToeMode): Board {
  return Array<Cell>(boardSize(mode) * boardSize(mode)).fill(null)
}

/** Every row, column, and the two main diagonals — the full win-line set for an N×N grid. */
export function winningLines(size: number): number[][] {
  const lines: number[][] = []
  for (let r = 0; r < size; r++) {
    lines.push(Array.from({ length: size }, (_, c) => r * size + c))
  }
  for (let c = 0; c < size; c++) {
    lines.push(Array.from({ length: size }, (_, r) => r * size + c))
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i))
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)))
  return lines
}

export function checkWinner(board: Board, size: number): WinResult | null {
  for (const line of winningLines(size)) {
    const [first, ...rest] = line
    const mark = board[first]
    if (mark && rest.every((i) => board[i] === mark)) {
      return { winner: mark, line }
    }
  }
  return null
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null)
}

export function availableMoves(board: Board): number[] {
  const moves: number[] = []
  board.forEach((cell, i) => {
    if (cell === null) moves.push(i)
  })
  return moves
}

export function otherMark(mark: Mark): Mark {
  return mark === 'X' ? 'O' : 'X'
}

export function applyMove(board: Board, index: number, mark: Mark): Board {
  const next = [...board]
  next[index] = mark
  return next
}
