import { randomInt } from '../../../lib/rng'
import { BOARD_SIZE, FRUIT_TYPES } from './types'
import type { Board, Cell } from './types'

export function indexOf(row: number, col: number): number {
  return row * BOARD_SIZE + col
}

export function rowColOf(index: number): [number, number] {
  return [Math.floor(index / BOARD_SIZE), index % BOARD_SIZE]
}

export function isAdjacent(a: number, b: number): boolean {
  const [rowA, colA] = rowColOf(a)
  const [rowB, colB] = rowColOf(b)
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1
}

/** A fresh cell, avoiding a fruit type that would complete a run of 3 with the two cells immediately left/above (so a freshly created board never starts with a match). */
function randomSafeFruit(board: Board, index: number, rng: () => number): number {
  const [row, col] = rowColOf(index)
  const banned = new Set<number>()

  if (col >= 2) {
    const a = board[indexOf(row, col - 1)]
    const b = board[indexOf(row, col - 2)]
    if (a && b && a.fruit === b.fruit) banned.add(a.fruit)
  }
  if (row >= 2) {
    const a = board[indexOf(row - 1, col)]
    const b = board[indexOf(row - 2, col)]
    if (a && b && a.fruit === b.fruit) banned.add(a.fruit)
  }

  let fruit = randomInt(rng, FRUIT_TYPES)
  let guard = 0
  while (banned.has(fruit) && guard < 20) {
    fruit = randomInt(rng, FRUIT_TYPES)
    guard++
  }
  return fruit
}

export function createBoard(rng: () => number): Board {
  const board: Board = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  for (let i = 0; i < board.length; i++) {
    board[i] = { fruit: randomSafeFruit(board, i, rng), special: 'none' }
  }
  return board
}

export function swapCells(board: Board, a: number, b: number): Board {
  const next = [...board]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/** Applies gravity (each column's cells fall to fill nulls below them) then refills empty top cells with fresh fruit. */
export function applyGravityAndRefill(board: Board, rng: () => number): Board {
  const next: Board = [...board]
  for (let col = 0; col < BOARD_SIZE; col++) {
    const column: (Cell | null)[] = []
    for (let row = 0; row < BOARD_SIZE; row++) column.push(next[indexOf(row, col)])
    const settled = column.filter((c): c is Cell => c !== null)
    const missing = BOARD_SIZE - settled.length
    const refill = Array.from({ length: missing }, () => ({
      fruit: randomInt(rng, FRUIT_TYPES),
      special: 'none' as const,
    }))
    const newColumn = [...refill, ...settled]
    for (let row = 0; row < BOARD_SIZE; row++) next[indexOf(row, col)] = newColumn[row]
  }
  return next
}

/** True if some adjacent swap on the board would create a match — used to detect a dead board that needs reshuffling. */
export function hasAnyPossibleMove(board: Board, findMatches: (b: Board) => number[][]): boolean {
  for (let i = 0; i < board.length; i++) {
    const [row, col] = rowColOf(i)
    const right = col < BOARD_SIZE - 1 ? indexOf(row, col + 1) : null
    const down = row < BOARD_SIZE - 1 ? indexOf(row + 1, col) : null
    for (const neighbor of [right, down]) {
      if (neighbor === null) continue
      const swapped = swapCells(board, i, neighbor)
      if (findMatches(swapped).length > 0) return true
    }
  }
  return false
}

/** A fresh board that's both match-free (createBoard's guarantee) and has at least one possible move — what "reshuffle" means when a settled board goes dead. */
export function createPlayableBoard(
  rng: () => number,
  findMatches: (b: Board) => number[][],
): Board {
  for (let attempt = 0; attempt < 50; attempt++) {
    const board = createBoard(rng)
    if (hasAnyPossibleMove(board, findMatches)) return board
  }
  // Astronomically unlikely at 8x8 with 6 fruit types, but never loop forever.
  return createBoard(rng)
}
