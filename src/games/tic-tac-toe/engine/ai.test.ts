import { describe, expect, it } from 'vitest'
import { applyMove, checkWinner, createEmptyBoard, isBoardFull, otherMark } from './board'
import { pickAiMove, suggestMove } from './ai'

describe('hard AI', () => {
  it('is unbeatable at classic 3x3 — two perfect players always draw', () => {
    for (let trial = 0; trial < 5; trial++) {
      let board = createEmptyBoard('classic')
      let turn: 'X' | 'O' = 'X'
      while (!checkWinner(board, 3) && !isBoardFull(board)) {
        const move = pickAiMove(board, 'classic', turn, 'hard')
        board = applyMove(board, move, turn)
        turn = otherMark(turn)
      }
      expect(checkWinner(board, 3)).toBeNull() // no winner possible between two perfect players
      expect(isBoardFull(board)).toBe(true)
    }
  })

  it('takes an immediate winning move when available', () => {
    // X to move, X already has two in the top row.
    let board = createEmptyBoard('classic')
    board = applyMove(board, 0, 'X')
    board = applyMove(board, 1, 'X')
    board = applyMove(board, 3, 'O')
    board = applyMove(board, 4, 'O')
    const move = pickAiMove(board, 'classic', 'X', 'hard')
    expect(move).toBe(2)
  })

  it('blocks an immediate opponent win', () => {
    // O to move; X threatens to complete the top row at index 2.
    let board = createEmptyBoard('classic')
    board = applyMove(board, 0, 'X')
    board = applyMove(board, 1, 'X')
    board = applyMove(board, 4, 'O')
    const move = pickAiMove(board, 'classic', 'O', 'hard')
    expect(move).toBe(2)
  })
})

describe('suggestMove (hint)', () => {
  it('always returns an empty cell', () => {
    let board = createEmptyBoard('classic')
    board = applyMove(board, 0, 'X')
    board = applyMove(board, 4, 'O')
    const move = suggestMove(board, 'classic', 'X')
    expect(board[move]).toBeNull()
  })
})

describe('easy/medium AI', () => {
  it('always returns a legal (empty) cell', () => {
    for (const difficulty of ['easy', 'medium'] as const) {
      let board = createEmptyBoard('classic')
      board = applyMove(board, 0, 'X')
      const move = pickAiMove(board, 'classic', 'O', difficulty)
      expect(board[move]).toBeNull()
    }
  })
})
