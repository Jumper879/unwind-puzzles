import { describe, expect, it } from 'vitest'
import { movesFrom, solveMinMoves } from './capturePuzzle'
import { CAPTURE_PUZZLES } from './capturePuzzles'

describe('movesFrom', () => {
  it('knight has up to 8 moves from the center of a 5x5 board', () => {
    const moves = movesFrom('knight', 12, 5, new Set())
    expect(moves).toHaveLength(8)
  })

  it('knight has fewer moves from a corner', () => {
    const moves = movesFrom('knight', 0, 5, new Set())
    expect(moves.length).toBeLessThan(8)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('rook slides until the board edge when nothing blocks it', () => {
    const moves = movesFrom('rook', 12, 5, new Set()) // center of 5x5: 2 in each of 4 directions
    expect(moves).toHaveLength(8)
  })

  it('rook stops at (and includes) the first occupied square, not past it', () => {
    // Rook at square 10 (row2,col0), occupied square at 11 (row2,col1) two away from edge.
    const moves = movesFrom('rook', 10, 5, new Set([12]))
    expect(moves).toContain(12) // can capture it
    expect(moves).not.toContain(13) // can't slide past it
    expect(moves).not.toContain(14)
  })

  it('bishop moves diagonally only', () => {
    const moves = movesFrom('bishop', 12, 5, new Set())
    // from center (2,2) of a 5x5: diagonals reach (0,0),(1,1),(3,3),(4,4),(0,4),(1,3),(3,1),(4,0) = 8
    expect(moves).toHaveLength(8)
  })
})

describe('solveMinMoves', () => {
  it('every shipped puzzle is solvable', () => {
    for (const puzzle of CAPTURE_PUZZLES) {
      const result = solveMinMoves(puzzle)
      expect(result, `puzzle "${puzzle.id}" should be solvable`).not.toBeNull()
      expect(result).toBeGreaterThan(0)
    }
  })

  it('a puzzle with no targets solves in 0 moves', () => {
    expect(
      solveMinMoves({
        id: 't',
        size: 5,
        pieceType: 'knight',
        start: 0,
        targets: [],
        difficulty: 'easy',
      }),
    ).toBe(0)
  })

  it('a single adjacent-reachable target solves in 1 move', () => {
    // Rook at 0 (0,0), target at 4 (0,4) — one straight slide away.
    expect(
      solveMinMoves({
        id: 't',
        size: 5,
        pieceType: 'rook',
        start: 0,
        targets: [4],
        difficulty: 'easy',
      }),
    ).toBe(1)
  })

  it('harder puzzles never solve in fewer moves than there are targets', () => {
    // Can capture at most one target per move, so min moves >= target count.
    for (const puzzle of CAPTURE_PUZZLES) {
      const result = solveMinMoves(puzzle)
      expect(result).toBeGreaterThanOrEqual(puzzle.targets.length)
    }
  })
})
