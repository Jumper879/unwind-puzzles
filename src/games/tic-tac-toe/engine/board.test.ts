import { describe, expect, it } from 'vitest'
import {
  applyMove,
  boardSize,
  checkWinner,
  createEmptyBoard,
  isBoardFull,
  winningLines,
} from './board'

describe('board', () => {
  it('classic is 3x3, connect4 is 4x4', () => {
    expect(boardSize('classic')).toBe(3)
    expect(boardSize('connect4')).toBe(4)
  })

  it('creates an empty board of the right size', () => {
    expect(createEmptyBoard('classic')).toHaveLength(9)
    expect(createEmptyBoard('connect4')).toHaveLength(16)
  })

  it('classic 3x3 has 8 winning lines (3 rows, 3 cols, 2 diagonals)', () => {
    expect(winningLines(3)).toHaveLength(8)
  })

  it('detects a row win', () => {
    let board = createEmptyBoard('classic')
    board = applyMove(board, 0, 'X')
    board = applyMove(board, 1, 'X')
    board = applyMove(board, 2, 'X')
    const result = checkWinner(board, 3)
    expect(result?.winner).toBe('X')
    expect(result?.line).toEqual([0, 1, 2])
  })

  it('detects a diagonal win', () => {
    let board = createEmptyBoard('classic')
    board = applyMove(board, 0, 'O')
    board = applyMove(board, 4, 'O')
    board = applyMove(board, 8, 'O')
    expect(checkWinner(board, 3)?.winner).toBe('O')
  })

  it('returns null with no winner', () => {
    const board = createEmptyBoard('classic')
    expect(checkWinner(board, 3)).toBeNull()
  })

  it('isBoardFull is accurate', () => {
    const empty = createEmptyBoard('classic')
    expect(isBoardFull(empty)).toBe(false)
    const full = empty.map((_, i) => (i % 2 === 0 ? 'X' : 'O')) as ('X' | 'O')[]
    expect(isBoardFull(full)).toBe(true)
  })
})
