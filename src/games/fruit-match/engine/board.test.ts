import { describe, expect, it } from 'vitest'
import { createRng } from '../../../lib/rng'
import {
  createBoard,
  createPlayableBoard,
  hasAnyPossibleMove,
  indexOf,
  isAdjacent,
  rowColOf,
} from './board'
import { findMatchGroups, findMatchedCellIndices } from './match'
import { BOARD_SIZE } from './types'

describe('createBoard', () => {
  it('is deterministic for the same seed', () => {
    const a = createBoard(createRng('seed-1'))
    const b = createBoard(createRng('seed-1'))
    expect(a).toEqual(b)
  })

  it('never starts with a match', () => {
    for (const seed of ['s1', 's2', 's3', 's4', 's5']) {
      const board = createBoard(createRng(seed))
      expect(findMatchGroups(board)).toHaveLength(0)
    }
  })

  it('fills every cell', () => {
    const board = createBoard(createRng('fill-check'))
    expect(board).toHaveLength(BOARD_SIZE * BOARD_SIZE)
    expect(board.every((c) => c !== null)).toBe(true)
  })
})

describe('indexOf / rowColOf', () => {
  it('round-trips', () => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        expect(rowColOf(indexOf(row, col))).toEqual([row, col])
      }
    }
  })
})

describe('isAdjacent', () => {
  it('true for orthogonal neighbors, false for diagonal or far', () => {
    expect(isAdjacent(indexOf(2, 2), indexOf(2, 3))).toBe(true)
    expect(isAdjacent(indexOf(2, 2), indexOf(3, 2))).toBe(true)
    expect(isAdjacent(indexOf(2, 2), indexOf(3, 3))).toBe(false)
    expect(isAdjacent(indexOf(2, 2), indexOf(2, 5))).toBe(false)
  })
})

describe('createPlayableBoard', () => {
  it('always has at least one possible move', () => {
    for (const seed of ['p1', 'p2', 'p3']) {
      const board = createPlayableBoard(createRng(seed), findMatchedCellIndices)
      expect(hasAnyPossibleMove(board, findMatchedCellIndices)).toBe(true)
    }
  })
})
